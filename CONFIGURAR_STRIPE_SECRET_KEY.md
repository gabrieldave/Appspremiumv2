# Configurar STRIPE_SECRET_KEY en Supabase

## Pasos para registrar la variable de entorno

1. **Accede al Dashboard de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Inicia sesión con tu cuenta

2. **Selecciona tu proyecto**
   - Proyecto: **Appspremium**
   - Project ID: `pezisfaeecgjdguneuip`

3. **Navega a Edge Functions → Settings**
   - En el menú lateral izquierdo, haz clic en **Edge Functions**
   - Luego haz clic en **Settings** (Configuración)

4. **Agrega el secreto STRIPE_SECRET_KEY**
   - En la sección **Secrets**, busca el campo para agregar nuevas variables
   - **Nombre de la variable**: `STRIPE_SECRET_KEY`
   - **Valor**: [Ingresa aquí tu clave secreta de Stripe que comienza con `sk_test_` o `sk_live_`]
   - Haz clic en **Save** o **Add Secret**
   
   **Nota**: La clave secreta de Stripe debe obtenerse desde tu Dashboard de Stripe:
   - Ve a: https://dashboard.stripe.com/test/apikeys (para claves de prueba)
   - O: https://dashboard.stripe.com/apikeys (para claves de producción)
   - Copia el valor de **Secret key** (no la Public key)

5. **Verifica que se guardó correctamente**
   - Deberías ver `STRIPE_SECRET_KEY` en la lista de secretos
   - El valor debe estar oculto (mostrando solo `••••••••`)

6. **Redespliega la Edge Function (opcional pero recomendado)**
   - Ve a **Edge Functions** → **stripe-checkout**
   - Haz clic en **Deploy** o **Redeploy** para asegurar que la función use la nueva variable

## Nota importante

- Los secretos configurados en Supabase Dashboard están disponibles automáticamente para todas las Edge Functions
- No necesitas reiniciar nada, los cambios se aplican inmediatamente
- La función `stripe-checkout` ya tiene código para leer esta variable usando `Deno.env.get('STRIPE_SECRET_KEY')`

## Verificación

Después de configurar el secreto, prueba crear una suscripción nuevamente. Si el error persiste, revisa los logs de la Edge Function en:
- **Edge Functions** → **stripe-checkout** → **Logs**

