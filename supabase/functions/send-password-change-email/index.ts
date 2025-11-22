import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SITE_URL = Deno.env.get('SITE_URL') || 'https://todossomostraders.com';
// Usar dominio verificado de Resend o el configurado
// Si RESEND_FROM_EMAIL no está configurado, usar el dominio verificado mail.codextrader.tech
const RESEND_FROM_EMAIL_RAW = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@mail.codextrader.tech';
const RESEND_FROM_EMAIL = RESEND_FROM_EMAIL_RAW.trim();

interface PasswordChangeEmailData {
  email: string;
  changeDate: string;
  changeTime: string;
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

    const { email, changeDate, changeTime } = await req.json() as PasswordChangeEmailData;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Si no hay RESEND_API_KEY, solo loguear
    if (!RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY no configurada, no se enviará email de cambio de contraseña');
      return new Response(
        JSON.stringify({ 
          message: 'Email de cambio de contraseña programado',
          note: 'Configura RESEND_API_KEY para enviar emails automáticamente'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usar Resend para enviar email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: email,
        subject: '✅ Contraseña Actualizada - Todos Somos Traders',
        html: getPasswordChangeEmailTemplate(email, changeDate, changeTime),
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Error enviando email de cambio de contraseña:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email de cambio de contraseña enviado correctamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en send-password-change-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function getPasswordChangeEmailTemplate(email: string, changeDate: string, changeTime: string): string {
  const year = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contraseña Cambiada - Todos Somos Traders</title>
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
                Contraseña Actualizada
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Cambio de Contraseña Exitoso</h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hola,</p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Te confirmamos que la contraseña de tu cuenta en <strong style="color: #2563eb;">Todos Somos Traders</strong> ha sido actualizada exitosamente.
              </p>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600; width: 160px;">Fecha del Cambio:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px;">${changeDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">Hora:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px;">${changeTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">Estado:</td>
                    <td style="padding: 10px 0; color: #166534; font-size: 14px; font-weight: 600;">✅ Contraseña actualizada correctamente</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">🔒 Importante - Seguridad</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                  <li>Si <strong>NO realizaste</strong> este cambio, contacta a soporte inmediatamente</li>
                  <li>Tu nueva contraseña es válida desde ahora</li>
                  <li>Si olvidaste tu nueva contraseña, puedes usar "Olvidé mi contraseña" para restablecerla</li>
                  <li>Mantén tu contraseña segura y no la compartas con nadie</li>
                </ul>
              </div>
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/portal" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Acceder a mi Portal
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta o no realizaste este cambio, por favor contacta a nuestro equipo de soporte de inmediato.
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

