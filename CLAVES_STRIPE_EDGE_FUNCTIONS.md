# 🔐 Claves de Stripe para Edge Functions

## ⚠️ IMPORTANTE: Configurar en Supabase Dashboard

Estas claves deben configurarse en **Supabase Dashboard → Edge Functions → Settings → Secrets**

**NO** deben estar en el archivo `.env` del frontend por seguridad.

---

## 📋 Variables a Configurar en Edge Functions

Ve a: [Supabase Dashboard](https://supabase.com/dashboard) → **Appspremium** → **Edge Functions** → **Settings** → **Secrets**

Agrega estas variables:

### Para TODAS las Edge Functions:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
```

### Solo para `stripe-webhook`:
```env
STRIPE_WEBHOOK_SECRET=whsec_... (obtener después de configurar el webhook)
```

---

## 🔑 Claves de Stripe Configuradas

### ✅ Publishable Key (Frontend)
- **Clave**: `pk_test_...` (obtener de Stripe Dashboard)
- **Ubicación**: `.env` del frontend (opcional)
- **Estado**: ⚠️ Configurar con tu clave de Stripe

### ✅ Secret Key (Edge Functions)
- **Clave**: `sk_test_...` (obtener de Stripe Dashboard)
- **Ubicación**: Edge Functions Settings (NO en .env del frontend)
- **Estado**: ⚠️ Pendiente configurar en Supabase Dashboard

### ⚠️ Webhook Secret (Edge Functions - stripe-webhook)
- **Clave**: `whsec_...` (por obtener)
- **Ubicación**: Edge Functions Settings
- **Estado**: ⚠️ Pendiente - se obtiene después de configurar el webhook

---

## 📝 Price ID Configurado

- **Price ID**: `price_1SVe48G2B99hBCyagkJXbc6w`
- **Estado**: ✅ Configurado en base de datos y código

---

## ✅ Pasos de Configuración

1. **Ir a Supabase Dashboard**:
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona proyecto: **Appspremium**

2. **Ir a Edge Functions Settings**:
   - Click en **Edge Functions** (menú lateral)
   - Click en **Settings** (o el ícono de configuración)
   - Ve a la sección **"Secrets"**

3. **Agregar Variables**:
   - Click en **"Add new secret"** o **"+ Add secret"**
   - Agrega cada variable una por una:
     - `SUPABASE_URL` = `https://tu-proyecto.supabase.co` (obtener de Supabase Dashboard)
     - `SUPABASE_SERVICE_ROLE_KEY` = `tu-service-role-key-aqui` (obtener de Supabase Dashboard → Settings → API)
     - `STRIPE_SECRET_KEY` = `sk_test_...` (obtener de Stripe Dashboard → Developers → API keys)

4. **Configurar Webhook en Stripe**:
   - Ve a [Stripe Dashboard](https://dashboard.stripe.com/) → **Webhooks**
   - Crea webhook con URL: `https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-webhook`
   - Selecciona eventos: `checkout.session.completed`, `customer.subscription.*`, etc.
   - Copia el **Signing secret** (`whsec_...`)

5. **Agregar Webhook Secret**:
   - Regresa a Supabase Dashboard → Edge Functions → Settings → Secrets
   - Agrega: `STRIPE_WEBHOOK_SECRET` = `whsec_...` (tu webhook secret)

---

## 🔒 Seguridad

⚠️ **NUNCA**:
- ❌ Subir estas claves a Git
- ❌ Exponer `STRIPE_SECRET_KEY` en el frontend
- ❌ Compartir estas claves públicamente
- ❌ Incluir `STRIPE_SECRET_KEY` en el archivo `.env` del frontend

✅ **SÍ**:
- ✅ Configurar en Supabase Dashboard → Edge Functions Settings
- ✅ Usar variables de entorno
- ✅ Mantener las claves secretas solo en el backend

---

## 📋 Resumen

| Variable | Valor | Ubicación | Estado |
|----------|-------|-----------|--------|
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `.env` frontend | ⚠️ Configurar |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Edge Functions | ⚠️ Pendiente |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Edge Functions | ⚠️ Pendiente |
| `Price ID` | `price_...` | Base de datos | ✅ |

---

## 🆘 Si Tienes Problemas

1. **Verifica que las claves estén correctas** (sin espacios extra)
2. **Verifica que estén en Edge Functions Settings**, no solo en `.env`
3. **Revisa los logs** de Edge Functions en Supabase Dashboard
4. **Verifica que el webhook esté configurado** correctamente en Stripe

