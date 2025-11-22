# 🔧 Solución Definitiva: Webhook 401 - Paso a Paso

## ❌ Problema Actual

El webhook `stripe-webhook` está devolviendo **401 Unauthorized**, lo que significa que:
- ❌ Stripe no puede enviar eventos al webhook
- ❌ Las suscripciones no se sincronizan automáticamente
- ❌ Los emails no se envían después de una compra
- ❌ El estado queda como "inactivo" aunque el pago fue exitoso

## ✅ Solución: Desactivar JWT Verification

Stripe **NO envía tokens JWT** en sus webhooks, por lo que debemos desactivar la verificación JWT para esta función específica.

### Pasos Detallados:

1. **Ve a Supabase Dashboard**
   - Abre: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Edge Functions**
   - En el menú lateral, haz clic en **"Edge Functions"**
   - O ve directamente a: `https://supabase.com/dashboard/project/[TU_PROJECT_ID]/functions`

3. **Encuentra la función `stripe-webhook`**
   - Busca en la lista de funciones
   - Haz clic en **`stripe-webhook`**

4. **Desactiva JWT Verification**
   - En la página de detalles de la función, busca la sección **"Settings"** o **"Configuration"**
   - Busca la opción **"Verify JWT"** o **"JWT Verification"**
   - **Desactívala** (debe quedar en OFF/desactivado)
   - Guarda los cambios

5. **Verifica que esté desactivado**
   - Deberías ver que `verify_jwt: false` en la configuración
   - O que el toggle esté en OFF

## 🔍 Verificación

Después de desactivar JWT verification:

1. **Haz una nueva suscripción de prueba**
2. **Revisa los logs del webhook**:
   - Ve a: Edge Functions → `stripe-webhook` → Logs
   - Deberías ver respuestas **200 OK** en lugar de **401**
3. **Verifica que lleguen los emails**
4. **Confirma que el estado se actualice a "activo"**

## 📝 Nota Importante

- **Solo desactiva JWT verification para `stripe-webhook`**
- Las otras funciones Edge (como `stripe-checkout`, `stripe-portal`) **SÍ deben tener JWT verification activado**
- El webhook de Stripe usa su propia firma de seguridad (`stripe-signature`), no JWT

## 🆘 Si No Encuentras la Opción

Si no ves la opción "Verify JWT" en la interfaz:

1. **Usa Supabase CLI** (si lo tienes instalado):
   ```bash
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

2. **O contacta con soporte de Supabase** para que lo desactiven manualmente

## ✅ Resultado Esperado

Una vez desactivado JWT verification:
- ✅ Los webhooks de Stripe se procesarán correctamente
- ✅ Las suscripciones se sincronizarán automáticamente
- ✅ Los emails se enviarán después de cada compra
- ✅ El estado se actualizará correctamente


