import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// Inicialización lazy para evitar errores en OPTIONS
let supabaseClient: ReturnType<typeof createClient> | null = null;
let stripeInstance: Stripe | null = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }
  return supabaseClient;
}

function getStripe() {
  if (!stripeInstance) {
    const stripeSecretRaw = Deno.env.get('STRIPE_SECRET_KEY');
    
    // Logging para debug (sin exponer el valor completo)
    if (!stripeSecretRaw) {
      console.error('❌ STRIPE_SECRET_KEY no encontrada en variables de entorno');
      console.error('Variables disponibles:', Object.keys(Deno.env.toObject()).filter(k => k.includes('STRIPE')));
      throw new Error('STRIPE_SECRET_KEY no está configurada. Verifica las variables de entorno en Supabase Dashboard → Edge Functions → Settings → Secrets');
    }
    
    // Limpiar espacios en blanco
    const stripeSecret = stripeSecretRaw.trim();
    
    // Verificar que la clave tenga el formato correcto
    if (!stripeSecret.startsWith('sk_')) {
      console.error('⚠️ STRIPE_SECRET_KEY no tiene el formato correcto (debe empezar con sk_)');
      console.error('Longitud de la clave:', stripeSecret.length);
      console.error('Primeros 5 caracteres:', stripeSecret.substring(0, 5));
      throw new Error('STRIPE_SECRET_KEY tiene un formato inválido');
    }
    
    console.log('✅ STRIPE_SECRET_KEY encontrada, inicializando Stripe...');
    console.log('Longitud de la clave:', stripeSecret.length);
    console.log('Prefijo de la clave:', stripeSecret.substring(0, 7) + '...');
    
    try {
      stripeInstance = new Stripe(stripeSecret, {
        appInfo: {
          name: 'Bolt Integration',
          version: '1.0.0',
        },
      });
      console.log('✅ Stripe inicializado correctamente');
    } catch (error: any) {
      console.error('❌ Error al inicializar Stripe:', error.message);
      throw error;
    }
  }
  return stripeInstance;
}

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

// CORS headers para preflight
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  // Manejar preflight CORS PRIMERO, antes de cualquier otra cosa
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Debug: Log todas las variables de entorno al inicio (solo en POST)
    if (req.method === 'POST') {
      const allEnvVars = Deno.env.toObject();
      const stripeVars = Object.keys(allEnvVars).filter(k => k.toUpperCase().includes('STRIPE'));
      console.log('🔍 Variables de entorno que contienen STRIPE:', stripeVars);
      console.log('🔍 Total de variables de entorno:', Object.keys(allEnvVars).length);
      console.log('🔍 STRIPE_SECRET_KEY existe?', Deno.env.get('STRIPE_SECRET_KEY') ? 'SÍ' : 'NO');
      if (Deno.env.get('STRIPE_SECRET_KEY')) {
        const key = Deno.env.get('STRIPE_SECRET_KEY')!;
        console.log('🔍 STRIPE_SECRET_KEY longitud:', key.length);
        console.log('🔍 STRIPE_SECRET_KEY primeros 10 chars:', key.substring(0, 10));
        console.log('🔍 STRIPE_SECRET_KEY últimos 10 chars:', key.substring(key.length - 10));
      }
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      return corsResponse({ error }, 400);
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase();
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError) {
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user) {
      return corsResponse({ error: 'User not found' }, 404);
    }

    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information from the database', getCustomerError);

      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    let customerId;

    /**
     * In case we don't have a mapping yet, the customer does not exist and we need to create one.
     */
    const stripe = getStripe();
    
    if (!customer || !customer.customer_id) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      console.log(`Created new Stripe customer ${newCustomer.id} for user ${user.id}`);

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);

        // Try to clean up both the Stripe customer and subscription record
        try {
          await stripe.customers.del(newCustomer.id);
          await supabase.from('stripe_subscriptions').delete().eq('customer_id', newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up after customer mapping error:', deleteError);
        }

        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      if (mode === 'subscription') {
        const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
          customer_id: newCustomer.id,
          status: 'not_started',
        });

        if (createSubscriptionError) {
          console.error('Failed to save subscription in the database', createSubscriptionError);

          // Try to clean up the Stripe customer since we couldn't create the subscription
          try {
            await stripe.customers.del(newCustomer.id);
          } catch (deleteError) {
            console.error('Failed to delete Stripe customer after subscription creation error:', deleteError);
          }

          return corsResponse({ error: 'Unable to save the subscription in the database' }, 500);
        }
      }

      customerId = newCustomer.id;

      console.log(`Successfully set up new customer ${customerId} with subscription record`);
    } else {
      customerId = customer.customer_id;

      // Verificar si el customer existe en Stripe (puede ser de test mode)
      try {
        await stripe.customers.retrieve(customerId);
      } catch (stripeError: any) {
        // Si el customer no existe o es de otro modo (test vs live), crear uno nuevo
        if (stripeError.code === 'resource_missing' || 
            stripeError.message?.includes('test mode') || 
            stripeError.message?.includes('live mode')) {
          console.log(`⚠️ Customer ${customerId} no existe o es de otro modo. Creando nuevo customer en modo actual...`);
          
          // Eliminar el customer de test de la base de datos
          await supabase.from('stripe_customers').delete().eq('customer_id', customerId);
          await supabase.from('stripe_subscriptions').delete().eq('customer_id', customerId);
          
          // Crear nuevo customer en el modo actual (live o test)
          const newCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: user.id,
            },
          });

          console.log(`✅ Creado nuevo customer ${newCustomer.id} para usuario ${user.id}`);

          const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
            user_id: user.id,
            customer_id: newCustomer.id,
          });

          if (createCustomerError) {
            console.error('Failed to save new customer information in the database', createCustomerError);
            try {
              await stripe.customers.del(newCustomer.id);
            } catch (deleteError) {
              console.error('Failed to delete Stripe customer after database error:', deleteError);
            }
            return corsResponse({ error: 'Failed to create customer mapping' }, 500);
          }

          customerId = newCustomer.id;
        } else {
          // Otro tipo de error, propagarlo
          throw stripeError;
        }
      }

      if (mode === 'subscription') {
        // Verify subscription exists for existing customer
        const { data: subscription, error: getSubscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (getSubscriptionError) {
          console.error('Failed to fetch subscription information from the database', getSubscriptionError);

          return corsResponse({ error: 'Failed to fetch subscription information' }, 500);
        }

        if (!subscription) {
          // Create subscription record for existing customer if missing
          const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').upsert({
            customer_id: customerId,
            status: 'not_started',
          }, {
            onConflict: 'customer_id'
          });

          if (createSubscriptionError) {
            console.error('Failed to create subscription record for existing customer', createSubscriptionError);

            return corsResponse({ error: 'Failed to create subscription record for existing customer' }, 500);
          }
        }
      }
    }

    // create Checkout Session con configuración internacional
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url,
      cancel_url,
      // Configuración para pagos internacionales
      billing_address_collection: 'auto', // Recopila dirección de facturación automáticamente (necesario para algunos países)
      locale: 'auto', // Detecta automáticamente el idioma del cliente
      // Permite que Stripe maneje la conversión de moneda automáticamente si está habilitada en el dashboard
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic', // Autenticación 3D Secure automática para mayor seguridad internacional
        },
      },
    });

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}
