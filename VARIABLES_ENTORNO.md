# Configuración de Variables de Entorno

## 📋 Resumen

Este documento explica dónde y cómo configurar todas las variables de entorno necesarias para el proyecto AppsPremium.

---

## 🎨 Frontend (.env)

Las variables del frontend están en el archivo `.env` en la raíz del proyecto.

**Variables configuradas:**
- ✅ `VITE_SUPABASE_URL` - URL de tu proyecto Supabase
- ✅ `VITE_SUPABASE_ANON_KEY` - Clave pública anónima de Supabase

**Importante:**
- Las variables del frontend DEBEN tener el prefijo `VITE_` para que Vite las reconozca
- La `SERVICE_ROLE_KEY` NUNCA debe estar en el frontend por seguridad

---

## 🔧 Edge Functions de Supabase

Las Edge Functions requieren variables de entorno que se configuran en el Dashboard de Supabase.

### Dónde configurarlas:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium**
3. Ve a: **Edge Functions** → **Settings**
4. En la sección **Secrets**, agrega las siguientes variables:

### Variables necesarias:

#### Para TODAS las Edge Functions:
```env
SUPABASE_URL=https://pezisfaeecgjdguneuip.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemlzZmFlZWNnamRndW5ldWlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY2NzMxMSwiZXhwIjoyMDc5MjQzMzExfQ.OxyUdSjIKtOitHUG4-S6uifhuqRbEvmKNGqPx081REs
STRIPE_SECRET_KEY=sk_test_... (tu clave secreta de Stripe)
```

#### Solo para `stripe-webhook`:
```env
STRIPE_WEBHOOK_SECRET=whsec_... (tu webhook secret de Stripe)
```

---

## 📝 Variables Actuales del Proyecto

### Supabase
- **Proyecto ID**: `pezisfaeecgjdguneuip`
- **URL**: `https://pezisfaeecgjdguneuip.supabase.co`
- **Anon Key**: Configurada en `.env`
- **Service Role Key**: Debe configurarse en Edge Functions (NO en .env del frontend)

### Stripe
- ⚠️ **Aún no configurado** - Necesitas:
  - Crear cuenta en Stripe
  - Obtener `STRIPE_SECRET_KEY`
  - Configurar webhook y obtener `STRIPE_WEBHOOK_SECRET`

---

## ✅ Checklist de Configuración

### Frontend
- [x] `.env` creado con `VITE_SUPABASE_URL`
- [x] `.env` creado con `VITE_SUPABASE_ANON_KEY`
- [ ] Verificar que las variables funcionan (`npm run dev`)

### Edge Functions
- [ ] `SUPABASE_URL` configurada en Edge Functions Settings
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada en Edge Functions Settings
- [ ] `STRIPE_SECRET_KEY` configurada (cuando tengas Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` configurada solo para stripe-webhook

---

## 🔒 Seguridad

### ⚠️ NUNCA hagas esto:
- ❌ Subir `.env` a Git (ya está en `.gitignore`)
- ❌ Exponer `SERVICE_ROLE_KEY` en el frontend
- ❌ Exponer `STRIPE_SECRET_KEY` en el frontend
- ❌ Compartir claves secretas en mensajes públicos

### ✅ Haz esto:
- ✅ Usar `.env.example` como plantilla
- ✅ Mantener todas las claves secretas en Supabase Dashboard
- ✅ Usar variables de entorno para todas las configuraciones sensibles

---

## 🚀 Próximos Pasos

1. **Configurar Edge Functions**:
   - Ve a Supabase Dashboard
   - Configura las variables de entorno para las Edge Functions
   - Usa los valores de `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` que tienes

2. **Configurar Stripe**:
   - Crea cuenta en Stripe
   - Obtén las claves API
   - Configura webhook
   - Agrega las claves a Edge Functions Settings

3. **Verificar**:
   - Ejecuta `npm run dev` para verificar que el frontend funciona
   - Revisa la consola para asegurarte de que las variables se cargan correctamente
