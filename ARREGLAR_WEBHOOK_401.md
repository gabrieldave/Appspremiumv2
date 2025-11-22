# Arreglar Error 401 en Webhook de Stripe

## 🔴 Problema Crítico

El webhook de Stripe está devolviendo **401 Unauthorized**, lo que significa que Stripe no puede enviar eventos al webhook. Esto causa que:
- ❌ Los correos NO se envíen
- ❌ Las suscripciones NO se sincronicen correctamente
- ❌ Los usuarios paguen pero no reciban confirmación

## ✅ Solución

El webhook de Stripe necesita tener **desactivada la verificación JWT** porque Stripe no envía tokens de autenticación JWT, solo envía la firma del webhook.

### Pasos para Arreglar:

1. **Ve a Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/pezisfaeecgjdguneuip

2. **Navega a Edge Functions**
   - En el menú lateral, haz clic en **Edge Functions**

3. **Selecciona `stripe-webhook`**
   - Haz clic en la función `stripe-webhook`

4. **Desactiva la Verificación JWT**
   - Busca la opción **"Verify JWT"** o **"Require Authentication"**
   - **DESACTÍVALA** (debe estar en OFF/No)
   - Esto permite que Stripe envíe eventos sin autenticación JWT

5. **Guarda los Cambios**

6. **Verifica en Stripe Dashboard**
   - Ve a: Stripe Dashboard → Developers → Webhooks
   - Selecciona tu webhook
   - Haz clic en **"Send test webhook"** o espera a que llegue un evento real
   - Deberías ver que ahora responde con **200 OK** en lugar de **401**

## 🔍 Verificación

Después de desactivar JWT, verifica en los logs:
- Ve a: Supabase Dashboard → Edge Functions → stripe-webhook → Logs
- Deberías ver respuestas **200** en lugar de **401**
- Deberías ver mensajes como:
  - `✅ Email de recibo enviado a: [email]`
  - `✅ Notificación de compra enviada al admin`

## ⚠️ Importante

- El webhook **SÍ** verifica la firma de Stripe (usando `stripe-signature` header)
- Solo desactivamos la verificación JWT de Supabase
- La seguridad sigue siendo fuerte porque verificamos la firma de Stripe

## 📝 Nota

Si después de desactivar JWT sigues viendo errores 401, verifica:
1. Que la URL del webhook en Stripe sea correcta
2. Que `STRIPE_WEBHOOK_SECRET` esté configurado correctamente en Supabase Secrets
3. Que el webhook esté activo en Stripe Dashboard




