import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@todossomostraders.com';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://todossomostraders.com';

const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
      
      // Enviar emails de suscripción
      if (event.type === 'checkout.session.completed') {
        const session = stripeData as Stripe.Checkout.Session;
        EdgeRuntime.waitUntil(sendPurchaseEmails(customerId, session, true));
      }
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed', // assuming we want to mark it as completed since payment is successful
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
        
        // Enviar emails de compra única
        const session = stripeData as Stripe.Checkout.Session;
        EdgeRuntime.waitUntil(sendPurchaseEmails(customerId, session, false));
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

async function sendPurchaseEmails(customerId: string, session: Stripe.Checkout.Session, isSubscription: boolean) {
  if (!RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY no configurada, no se enviarán emails de compra');
    return;
  }

  try {
    // Obtener información del cliente desde Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const customerEmail = customer.email;
    
    if (!customerEmail) {
      console.error('No se encontró email del cliente');
      return;
    }

    // Obtener información del usuario desde Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .single();

    const userId = profile?.id || 'N/A';
    
    // Obtener información de la suscripción si es suscripción
    let subscription: Stripe.Subscription | null = null;
    let subscriptionData: any = {};
    
    if (isSubscription && session.subscription) {
      subscription = await stripe.subscriptions.retrieve(
        typeof session.subscription === 'string' ? session.subscription : session.subscription.id
      );
      
      subscriptionData = {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        startDate: new Date(subscription.current_period_start * 1000).toLocaleDateString('es-MX'),
        endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('es-MX'),
        nextPaymentDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('es-MX'),
      };
    }

    // Obtener información del producto/precio
    let productName = 'Producto Premium';
    if (session.line_items) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      if (lineItems.data.length > 0) {
        const priceId = lineItems.data[0].price?.id;
        if (priceId) {
          const price = await stripe.prices.retrieve(priceId);
          if (price.product) {
            const product = await stripe.products.retrieve(
              typeof price.product === 'string' ? price.product : price.product.id
            );
            productName = product.name;
          }
        }
      }
    }

    // Formatear montos
    const amount = (session.amount_total || 0) / 100;
    const currency = (session.currency || 'usd').toUpperCase();
    const purchaseDate = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Enviar email de recibo al usuario
    const receiptEmailHtml = getPurchaseReceiptTemplate({
      productName,
      purchaseType: isSubscription ? 'Suscripción' : 'Compra única',
      amount: amount.toFixed(2),
      currency,
      purchaseDate,
      transactionId: session.id,
      isSubscription,
      ...subscriptionData,
    });

    const receiptResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Todos Somos Traders <noreply@todossomostraders.com>',
        to: customerEmail,
        subject: `✅ Recibo de Compra - ${productName}`,
        html: receiptEmailHtml,
      }),
    });

    if (!receiptResponse.ok) {
      const error = await receiptResponse.text();
      console.error('Error enviando recibo al usuario:', error);
    } else {
      console.info(`Email de recibo enviado a: ${customerEmail}`);
    }

    // Enviar notificación al admin
    const adminNotificationHtml = getAdminPurchaseNotificationTemplate({
      customerEmail,
      userId,
      stripeCustomerId: customerId,
      productName,
      purchaseType: isSubscription ? 'Suscripción' : 'Compra única',
      amount: amount.toFixed(2),
      currency,
      purchaseDate,
      transactionId: session.id,
      paymentStatus: session.payment_status || 'paid',
      isSubscription,
      ...subscriptionData,
    });

    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Todos Somos Traders <noreply@todossomostraders.com>',
        to: ADMIN_EMAIL,
        subject: `💰 Nueva ${isSubscription ? 'Suscripción' : 'Compra'}: ${productName}`,
        html: adminNotificationHtml,
      }),
    });

    if (!adminResponse.ok) {
      const error = await adminResponse.text();
      console.error('Error enviando notificación al admin:', error);
    } else {
      console.info(`Notificación de compra enviada al admin: ${ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error('Error enviando emails de compra:', error);
  }
}

function getPurchaseReceiptTemplate(data: {
  productName: string;
  purchaseType: string;
  amount: string;
  currency: string;
  purchaseDate: string;
  transactionId: string;
  isSubscription: boolean;
  subscriptionId?: string;
  subscriptionStatus?: string;
  startDate?: string;
  endDate?: string;
  nextPaymentDate?: string;
}): string {
  const year = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Compra - Todos Somos Traders</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <img src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg" alt="Todos Somos Traders" style="max-width: 120px; height: auto; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                ¡Gracias por tu Compra!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Recibo de Compra</h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hola,</p>
              <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Gracias por tu compra en <strong style="color: #2563eb;">Todos Somos Traders</strong>. Tu pago ha sido procesado exitosamente${data.isSubscription ? ' y tu suscripción está activa' : ''}.
              </p>
              <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px; font-weight: 600;">📋 Detalles de tu Compra</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 160px;">Producto:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${data.productName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 600;">Tipo:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${data.purchaseType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 600;">Monto:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 16px; font-weight: 600;">${data.amount} ${data.currency}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 600;">Fecha de Compra:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${data.purchaseDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; font-weight: 600;">ID de Transacción:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-family: monospace;">${data.transactionId}</td>
                  </tr>
                </table>
              </div>
              ${data.isSubscription && data.endDate ? `
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 20px 0; color: #166534; font-size: 18px; font-weight: 600;">⏰ Información de tu Suscripción</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600; width: 180px;">Estado:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">✅ Activa</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">Fecha de Inicio:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px;">${data.startDate || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">Próxima Renovación:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">${data.endDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">Próximo Pago:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px;">${data.nextPaymentDate || data.endDate}</td>
                  </tr>
                </table>
                <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 6px; border-left: 4px solid #22c55e;">
                  <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                    <strong>💡 Recordatorio:</strong> Tu suscripción se renovará automáticamente el ${data.endDate}. Puedes gestionar tu suscripción desde tu perfil en cualquier momento.
                  </p>
                </div>
              </div>
              ` : ''}
              <div style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">✨ Acceso Activo a:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                  <li><strong>Apps Premium:</strong> Acceso completo a todas nuestras herramientas profesionales</li>
                  <li><strong>Descargas Ilimitadas:</strong> Descarga todas las versiones de nuestros sistemas MT4</li>
                  <li><strong>Actualizaciones Automáticas:</strong> Recibe todas las mejoras y nuevas funcionalidades</li>
                  <li><strong>Soporte VIP 24/7:</strong> Atención prioritaria por WhatsApp y canales exclusivos</li>
                  <li><strong>Señales de Noticias Telegram:</strong> Acceso al canal exclusivo con análisis en tiempo real</li>
                </ul>
              </div>
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/portal" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Acceder a mi Portal Premium
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta sobre tu compra o suscripción, no dudes en contactarnos. Estamos aquí para ayudarte.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Todos Somos Traders</p>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px;">Portal Premium de Herramientas de Trading Profesional</p>
              <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px;">© ${year} Todos Somos Traders. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getAdminPurchaseNotificationTemplate(data: {
  customerEmail: string;
  userId: string;
  stripeCustomerId: string;
  productName: string;
  purchaseType: string;
  amount: string;
  currency: string;
  purchaseDate: string;
  transactionId: string;
  paymentStatus: string;
  isSubscription: boolean;
  subscriptionId?: string;
  subscriptionStatus?: string;
  startDate?: string;
  endDate?: string;
}): string {
  const year = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Compra/Suscripción - Todos Somos Traders</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">💰 Nueva Compra/Suscripción</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hola Administrador,</p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Se ha procesado una nueva <strong>${data.purchaseType}</strong> en <strong>Todos Somos Traders</strong>.
              </p>
              <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Información del Cliente</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">Email:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${data.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">ID de Usuario:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: monospace;">${data.userId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">ID de Cliente Stripe:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: monospace;">${data.stripeCustomerId}</td>
                  </tr>
                </table>
              </div>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px; font-weight: 600;">Detalles de la Transacción</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600; width: 180px;">Producto:</td>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px;">${data.productName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">Tipo:</td>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">${data.purchaseType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">Monto:</td>
                    <td style="padding: 8px 0; color: #166534; font-size: 16px; font-weight: 700;">${data.amount} ${data.currency}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">Fecha:</td>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px;">${data.purchaseDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">ID de Transacción:</td>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-family: monospace;">${data.transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">Estado:</td>
                    <td style="padding: 8px 0; color: #166534; font-size: 14px; font-weight: 600;">✅ ${data.paymentStatus}</td>
                  </tr>
                </table>
              </div>
              ${data.isSubscription && data.subscriptionId ? `
              <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Información de Suscripción</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 180px;">ID de Suscripción:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: monospace;">${data.subscriptionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Estado:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${data.subscriptionStatus || 'active'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Fecha de Inicio:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${data.startDate || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Próxima Renovación:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${data.endDate || 'N/A'}</td>
                  </tr>
                </table>
              </div>
              ` : ''}
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/admin" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);">
                      Ver en Panel de Administración
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Puedes gestionar esta transacción y todas las demás desde el panel de administración.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Todos Somos Traders</p>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px;">Panel de Administración</p>
              <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px;">© ${year} Todos Somos Traders. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
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
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}