# Cuándo se Envían los Correos de Compra/Suscripción

## 📧 Flujo de Envío de Correos

Los correos se envían automáticamente cuando Stripe procesa un pago exitoso a través del **webhook de Stripe**.

### Evento que Dispara los Correos

Los correos se envían cuando Stripe envía el evento `checkout.session.completed` al webhook `stripe-webhook`.

### ¿Cuándo Ocurre Esto?

1. **Usuario completa el pago en Stripe Checkout**
2. **Stripe procesa el pago exitosamente**
3. **Stripe envía el evento `checkout.session.completed` al webhook**
4. **El webhook procesa el evento y envía los correos**

**⚠️ IMPORTANTE**: Los correos NO se envían inmediatamente después de que el usuario ve la página de éxito. Se envían cuando Stripe procesa el webhook, lo cual puede tomar unos segundos o minutos.

## 📨 Correos que se Envían

### 1. Correo de Recibo al Usuario
- **Destinatario**: Email del cliente registrado en Stripe
- **Asunto**: `✅ Recibo de Compra - [Nombre del Producto]`
- **Contenido**: Detalles de la compra/suscripción, monto, fechas, etc.

### 2. Notificación al Administrador
- **Destinatario**: Email configurado en `ADMIN_EMAIL` (default: `admin@todossomostraders.com`)
- **Asunto**: `💰 Nueva Suscripción: [Nombre del Producto]` o `💰 Nueva Compra: [Nombre del Producto]`
- **Contenido**: Información del cliente, detalles de la transacción, etc.

## ⚙️ Configuración Requerida

Para que los correos se envíen, debes tener configurado:

1. **RESEND_API_KEY** en Supabase Edge Functions Secrets
   - Ve a: Supabase Dashboard → Edge Functions → Settings → Secrets
   - Agrega: `RESEND_API_KEY` con tu clave de API de Resend

2. **ADMIN_EMAIL** (opcional, tiene default)
   - Default: `admin@todossomostraders.com`
   - Puedes configurarlo en Secrets si quieres otro email

3. **Webhook de Stripe configurado correctamente**
   - URL del webhook debe apuntar a: `https://[tu-proyecto].supabase.co/functions/v1/stripe-webhook`
   - Debe estar configurado para recibir el evento `checkout.session.completed`

## 🔍 Cómo Verificar si los Correos se Están Enviando

### 1. Revisar Logs del Webhook
- Ve a: Supabase Dashboard → Edge Functions → stripe-webhook → Logs
- Busca mensajes como:
  - `✅ Email de recibo enviado a: [email]`
  - `✅ Notificación de compra enviada al admin: [email]`
  - `⚠️ RESEND_API_KEY no configurada` (si falta la configuración)

### 2. Verificar en Resend Dashboard
- Ve a: https://resend.com/emails
- Deberías ver los emails enviados con el estado (enviado, entregado, etc.)

### 3. Verificar en Stripe Dashboard
- Ve a: Stripe Dashboard → Developers → Webhooks
- Revisa los eventos enviados y las respuestas del webhook

## 🐛 Problemas Comunes

### Los correos no se envían

1. **Verifica que `RESEND_API_KEY` esté configurada**
   ```bash
   # En Supabase Dashboard → Edge Functions → Settings → Secrets
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

2. **Verifica que el webhook esté recibiendo eventos**
   - Revisa los logs del webhook en Supabase
   - Verifica que Stripe esté enviando eventos correctamente

3. **Verifica que el email del cliente esté en Stripe**
   - El correo se envía al email registrado en el `customer` de Stripe
   - Verifica en Stripe Dashboard → Customers

4. **Revisa los logs de errores**
   - Los errores aparecerán en los logs del webhook
   - Busca mensajes que empiecen con `❌` o `Error`

### El correo llega a spam

- Verifica la configuración de SPF/DKIM en Resend
- Asegúrate de que el dominio esté verificado en Resend

## 📝 Notas Importantes

- Los correos se envían de forma **asíncrona** usando `EdgeRuntime.waitUntil()`
- Esto significa que el webhook responde inmediatamente, pero los correos se envían en segundo plano
- Si hay un error al enviar el correo, no afecta el procesamiento del pago
- Los errores se registran en los logs del webhook


