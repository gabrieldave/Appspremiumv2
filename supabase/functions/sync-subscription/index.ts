import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, customerId } = await req.json();

    if (!userId && !customerId) {
      return new Response(
        JSON.stringify({ error: 'userId or customerId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let targetCustomerId: string | null = null;
    let targetUserId: string | null = null;

    if (customerId) {
      targetCustomerId = customerId;
      // Buscar el user_id asociado
      const { data: customerData } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .is('deleted_at', null)
        .maybeSingle();
      targetUserId = customerData?.user_id || null;
    } else if (userId) {
      targetUserId = userId;
      // Buscar el customer_id asociado
      const { data: profileData } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .maybeSingle();
      targetCustomerId = profileData?.stripe_customer_id || null;

      // Si no está en profiles, buscar en stripe_customers
      if (!targetCustomerId) {
        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .maybeSingle();
        targetCustomerId = customerData?.customer_id || null;
      }
    }

    if (!targetCustomerId) {
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found for this user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sincronizando suscripción para customer: ${targetCustomerId}, user: ${targetUserId}`);

    // Obtener suscripciones de Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: targetCustomerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      // No hay suscripciones, actualizar a inactive
      await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: targetCustomerId,
          subscription_status: 'not_started',
          status: 'not_started',
        },
        { onConflict: 'customer_id' }
      );

      if (targetUserId) {
        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'inactive',
            subscription_end_date: null,
          })
          .eq('id', targetUserId);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No subscriptions found in Stripe. Status set to inactive.',
          customerId: targetCustomerId,
          userId: targetUserId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = subscriptions.data[0];

    // Sincronizar en stripe_subscriptions (esto activará el trigger)
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: targetCustomerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      { onConflict: 'customer_id' }
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to sync subscription', details: subError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // El trigger debería actualizar profiles automáticamente, pero lo hacemos manualmente por si acaso
    if (targetUserId) {
      const subscriptionStatus = subscription.status === 'active' || subscription.status === 'trialing' 
        ? 'active' 
        : subscription.status === 'canceled' 
        ? 'canceled'
        : subscription.status === 'past_due'
        ? 'past_due'
        : 'inactive';

      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: targetCustomerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          subscription_end_date: subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        })
        .eq('id', targetUserId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription synced successfully',
        customerId: targetCustomerId,
        userId: targetUserId,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


