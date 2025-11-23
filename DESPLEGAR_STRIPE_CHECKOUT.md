# 🚀 Desplegar Función stripe-checkout Actualizada

## 📋 Pasos para Desplegar desde Supabase Dashboard

### Paso 1: Acceder al Dashboard
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

### Paso 2: Ir a Edge Functions
1. En el menú lateral, haz clic en **"Edge Functions"**
2. Busca la función **`stripe-checkout`** en la lista
3. Haz clic en **`stripe-checkout`**

### Paso 3: Actualizar el Código
1. En el editor de código, selecciona **TODO** el código existente (Ctrl+A)
2. Elimínalo (Delete o Backspace)
3. Copia el código completo del archivo: `supabase/functions/stripe-checkout/index.ts`
4. Pégalo en el editor (Ctrl+V)

### Paso 4: Desplegar
1. Haz clic en el botón **"Deploy"** o **"Save"** (generalmente en la esquina superior derecha)
2. Espera a que se complete el despliegue (verás un mensaje de confirmación)

### Paso 5: Verificar
1. Deberías ver un mensaje de éxito: "Function deployed successfully"
2. La función ahora está actualizada con soporte para pagos internacionales

## ✅ Cambios Incluidos en esta Actualización

La función ahora incluye:
- ✅ **Recopilación automática de dirección de facturación** - Necesaria para pagos internacionales
- ✅ **Autenticación 3D Secure automática** - Mejora la seguridad y aceptación
- ✅ **Soporte para conversión de moneda** - Stripe maneja la conversión automáticamente

## 🔍 Verificar que Funciona

Después de desplegar:
1. Prueba hacer un checkout desde tu aplicación
2. Verifica que los clientes mexicanos puedan proceder al pago
3. Revisa los logs en Supabase Dashboard → Edge Functions → stripe-checkout → Logs

## 📝 Nota Importante

**NO necesitas cambiar las variables de entorno** - Las mismas variables que ya tienes configuradas funcionarán con esta actualización.

Las variables que ya deberías tener configuradas son:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

## 🆘 Si Tienes Problemas

Si el despliegue falla:
1. Verifica que copiaste TODO el código correctamente
2. Revisa que no haya errores de sintaxis en el editor
3. Verifica que las variables de entorno estén configuradas
4. Revisa los logs de la función para ver errores específicos

