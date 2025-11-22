# 🔧 Solución: Error "Neither apiKey nor config.authenticator provided"

## ❌ Problema

Error en la Edge Function `stripe-checkout`:

```
Error: Neither apiKey nor config.authenticator provided
at Stripe._setAuthenticator
```

Este error significa que la variable de entorno `STRIPE_SECRET_KEY` **NO está configurada** en la Edge Function.

## ✅ Solución: Configurar STRIPE_SECRET_KEY

### Paso 1: Obtener tu Stripe Secret Key

1. **Ve a Stripe Dashboard**: [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2. **Inicia sesión** en tu cuenta
3. **Ve a Developers** → **API keys**
4. **Copia tu "Secret key"**:
   - Si estás en modo **Test**, copia la clave que empieza con `sk_test_...`
   - Si estás en modo **Live**, copia la clave que empieza con `sk_live_...`
   - ⚠️ **NUNCA compartas esta clave públicamente**

### Paso 2: Configurar en Supabase Dashboard

1. **Ve a Supabase Dashboard**:
   - Abre: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto: **Appspremium** (`pezisfaeecgjdguneuip`)

2. **Ir a Edge Functions**:
   - En el menú lateral, haz clic en **"Edge Functions"**
   - Busca y haz clic en **`stripe-checkout`**

3. **Ir a Settings/Secrets**:
   - En la página de la función, busca la pestaña **"Settings"** o **"Secrets"**
   - O busca un botón que diga **"Add new secret"** o **"Environment Variables"**

4. **Agregar STRIPE_SECRET_KEY**:
   - Haz clic en **"Add new secret"** o **"Add variable"**
   - **Nombre**: `STRIPE_SECRET_KEY`
   - **Valor**: Pega tu Stripe Secret Key (ejemplo: `sk_test_51...` o `sk_live_51...`)
   - Haz clic en **"Save"** o **"Add"**

5. **Verificar otras variables necesarias**:
   Asegúrate de que también estén configuradas estas variables:
   - ✅ `SUPABASE_URL` = `https://pezisfaeecgjdguneuip.supabase.co`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)
   - ✅ `STRIPE_SECRET_KEY` = (tu Stripe secret key) ← **Esta es la que falta**
   - ✅ `SITE_URL` = `https://todossomostraders.com` (opcional)

### Paso 3: Verificar que se Guardó

1. **Vuelve a la lista de secrets/variables**
2. **Verifica que `STRIPE_SECRET_KEY` aparezca en la lista**
3. **Asegúrate de que el valor esté correcto** (sin espacios al inicio o final)

### Paso 4: Probar de Nuevo

1. **Intenta suscribirte de nuevo** desde la aplicación
2. **Si aún hay errores**, revisa los logs:
   - Edge Functions → `stripe-checkout` → **Logs**
   - Busca errores relacionados con Stripe o autenticación

## 📋 Variables Requeridas para stripe-checkout

Asegúrate de tener **TODAS** estas variables configuradas:

| Variable | Descripción | Dónde Obtenerla |
|----------|------------|-----------------|
| `SUPABASE_URL` | URL de tu proyecto Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key de Supabase | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | Secret Key de Stripe | Stripe Dashboard → Developers → API keys |
| `SITE_URL` | URL de tu aplicación (opcional) | Tu dominio: `https://todossomostraders.com` |

## 🔍 Verificación Rápida

Para verificar que todas las variables están configuradas:

1. **Edge Functions** → **`stripe-checkout`** → **Settings/Secrets**
2. **Deberías ver estas 4 variables** (o al menos las 3 primeras):
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `STRIPE_SECRET_KEY` ← **Esta es la que falta**
   - ✅ `SITE_URL` (opcional)

## ⚠️ Notas Importantes

- **NUNCA** compartas tu `STRIPE_SECRET_KEY` públicamente
- **Usa `sk_test_...`** para desarrollo/testing
- **Usa `sk_live_...`** solo para producción
- **Las variables se aplican inmediatamente** después de guardarlas (no necesitas redeploy)

## 🆘 Si el Problema Persiste

1. **Verifica que copiaste la clave completa** (sin espacios)
2. **Verifica que estás usando la clave correcta** (test vs live)
3. **Revisa los logs de la Edge Function** para ver si hay otros errores
4. **Asegúrate de que la función esté desplegada** correctamente

---

**Última actualización**: Después de identificar el error de Stripe Secret Key faltante



