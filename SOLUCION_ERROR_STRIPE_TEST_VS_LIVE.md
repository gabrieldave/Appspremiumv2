# 🔴 SOLUCIÓN: Error "test mode key was used to make this request"

## ❌ Problema

El error que estás viendo:
```
No such price: 'price_1SRejEG2B99hBCyaNTpL8x3I'; 
a similar object exists in live mode, but a test mode key was used to make this request.
```

**Significa que:**
- ✅ El Price ID está correcto (`price_1SRejEG2B99hBCyaNTpL8x3I` - producción)
- ❌ Pero la `STRIPE_SECRET_KEY` en Supabase está configurada con una clave de **TEST** (`sk_test_...`)
- ❌ Necesitas usar una clave de **PRODUCCIÓN** (`sk_live_...`)

---

## ✅ Solución: Actualizar STRIPE_SECRET_KEY en Supabase

### Paso 1: Obtener tu Stripe Secret Key de Producción

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. **Asegúrate de estar en modo LIVE** (toggle en la esquina superior derecha debe decir "Live")
3. Ve a: **Developers** → **API keys**
4. Busca la sección **"Secret key"** (no "Publishable key")
5. Click en **"Reveal test key"** o **"Reveal live key"** según corresponda
6. Copia la clave que empieza con `sk_live_...` (NO `sk_test_...`)

⚠️ **IMPORTANTE**: 
- Debe empezar con `sk_live_` (no `sk_test_`)
- Es una clave larga (más de 100 caracteres)
- **NUNCA** la compartas públicamente

---

### Paso 2: Actualizar en Supabase Edge Functions

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium**
3. Ve a: **Edge Functions** → **Settings** → **Secrets**
4. Busca la variable `STRIPE_SECRET_KEY`
5. Click en el **ícono de editar** (lápiz) o **"Edit"**
6. **Reemplaza** el valor actual con tu clave de producción:
   - Valor anterior: `sk_test_...` ❌
   - Valor nuevo: `sk_live_...` ✅
7. Click en **"Save"** o **"Update"**

---

### Paso 3: Verificar que se Actualizó Correctamente

1. En la misma página de Secrets, verifica que `STRIPE_SECRET_KEY`:
   - ✅ Empieza con `sk_live_` (no `sk_test_`)
   - ✅ Tiene una longitud de más de 100 caracteres
   - ✅ No tiene espacios al inicio o final

---

### Paso 4: Redesplegar Edge Functions (Opcional pero Recomendado)

Después de actualizar la variable, es recomendable redesplegar las Edge Functions:

**Opción A: Desde Supabase Dashboard**
1. Ve a **Edge Functions**
2. Para cada función (`stripe-checkout`, `stripe-webhook`, `stripe-portal`):
   - Click en los **3 puntos (...)** → **"Redeploy"**

**Opción B: Desde Terminal**
```bash
# Desde la raíz del proyecto
cd supabase/functions

# Redesplegar cada función
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy stripe-portal
```

---

## ✅ Verificación Final

1. Intenta hacer una suscripción desde la app
2. El error debería desaparecer
3. Deberías poder completar el checkout de Stripe

---

## 📋 Checklist

- [ ] Obtuve la clave `sk_live_...` de Stripe Dashboard (modo Live)
- [ ] Actualicé `STRIPE_SECRET_KEY` en Supabase Edge Functions Secrets
- [ ] Verifiqué que la clave empieza con `sk_live_` (no `sk_test_`)
- [ ] Redesplegué las Edge Functions (opcional)
- [ ] Probé hacer una suscripción y funcionó correctamente

---

## 🔍 Cómo Identificar el Problema

Si ves este error en los logs de Supabase:
- **Error**: `test mode key was used` → Clave de TEST
- **Error**: `live mode key was used` → Clave de LIVE (correcto)

O en el código de la Edge Function, puedes verificar el prefijo:
```typescript
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
console.log('Prefijo:', stripeSecret?.substring(0, 7)); // Debe ser "sk_live"
```

---

## ⚠️ Notas Importantes

1. **No mezcles claves de TEST y LIVE**:
   - Si usas `sk_test_...` → Solo funcionan price IDs de test
   - Si usas `sk_live_...` → Solo funcionan price IDs de producción

2. **El Price ID ya está correcto**:
   - `price_1SRejEG2B99hBCyaNTpL8x3I` es de producción ✅
   - No necesitas cambiarlo

3. **También verifica Vercel**:
   - En Vercel, la variable `VITE_STRIPE_PUBLISHABLE_KEY` debe ser `pk_live_...` (no `pk_test_...`)
   - Pero este error específico es de la Edge Function, no del frontend

---

**Última actualización**: 2025-11-22
