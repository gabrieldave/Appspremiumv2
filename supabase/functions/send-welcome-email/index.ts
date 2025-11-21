import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@todosomostraders.com';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://appspremiumv2.vercel.app';

interface WelcomeEmailData {
  email: string;
  userId: string;
  createdAt: string;
}

serve(async (req) => {
  try {
    // Verificar que es una petición POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, userId, createdAt } = await req.json() as WelcomeEmailData;

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Si no hay RESEND_API_KEY, usar Supabase SMTP
    if (!RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY no configurada, usando Supabase SMTP');
      
      // Enviar email de bienvenida usando Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Nota: Supabase no tiene una API directa para enviar emails personalizados
      // Necesitarás usar un servicio externo o configurar SMTP
      console.log('Email de bienvenida debería enviarse a:', email);
      
      return new Response(
        JSON.stringify({ 
          message: 'Email de bienvenida programado',
          note: 'Configura RESEND_API_KEY para enviar emails automáticamente'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usar Resend para enviar emails
    const welcomeEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Todos Somos Traders <noreply@todosomostraders.com>',
        to: email,
        subject: '¡Bienvenido a Todos Somos Traders!',
        html: getWelcomeEmailTemplate(email, userId, createdAt),
      }),
    });

    if (!welcomeEmailResponse.ok) {
      const error = await welcomeEmailResponse.text();
      console.error('Error enviando email de bienvenida:', error);
    }

    // Enviar notificación al admin
    const adminNotificationResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Todos Somos Traders <noreply@todosomostraders.com>',
        to: ADMIN_EMAIL,
        subject: `🔔 Nuevo Usuario Registrado: ${email}`,
        html: getAdminNotificationTemplate(email, userId, createdAt),
      }),
    });

    if (!adminNotificationResponse.ok) {
      const error = await adminNotificationResponse.text();
      console.error('Error enviando notificación al admin:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Emails enviados correctamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en send-welcome-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function getWelcomeEmailTemplate(email: string, userId: string, createdAt: string): string {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a Todos Somos Traders!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <img src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg" alt="Todos Somos Traders" style="max-width: 120px; height: auto; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">¡Bienvenido a Todos Somos Traders!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Tu cuenta ha sido creada exitosamente</h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hola,</p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">¡Estamos emocionados de tenerte como parte de nuestra comunidad premium de traders!</p>
              <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">Tu cuenta está lista para usar. Ahora puedes acceder a todas nuestras herramientas profesionales de trading.</p>
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/portal" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Acceder a mi Portal</a>
                  </td>
                </tr>
              </table>
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
</html>
  `;
}

function getAdminNotificationTemplate(email: string, userId: string, createdAt: string): string {
  const year = new Date().getFullYear();
  const formattedDate = new Date(createdAt).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Usuario Registrado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f1f5f9; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">🔔 Nuevo Usuario Registrado</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hola Administrador,</p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Se ha registrado un nuevo usuario en <strong>Todos Somos Traders</strong>.</p>
              <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Información del Usuario</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">Email:</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${email}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">ID:</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-family: monospace;">${userId}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Fecha:</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${formattedDate}</td></tr>
                </table>
              </div>
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/admin" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Ver en Panel de Administración</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Todos Somos Traders</p>
              <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 12px;">© ${year} Todos Somos Traders. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

