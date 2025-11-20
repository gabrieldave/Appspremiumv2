# 🔐 Configuración Final de Edge Functions

## ✅ Webhook Secret Obtenido

- **STRIPE_WEBHOOK_SECRET**: `whsec_F2wUIkkSkQXwHn2xmimusGjSRqfI9aLj`

---

## 📋 Variables a Configurar en Supabase Dashboard

Ve a: [Supabase Dashboard](https://supabase.com/dashboard) → **Appspremium** → **Edge Functions** → **Settings** → **Secrets**

### Agrega estas 4 variables:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co

SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui

STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
```

---

## 🚀 Pasos para Configurar

1. **Ir a Supabase Dashboard**:
   - https://supabase.com/dashboard/project/pezisfaeecgjdguneuip/edge-functions

2. **Ir a Settings**:
   - Click en **"Settings"** o el ícono de configuración ⚙️
   - O ve directamente a: https://supabase.com/dashboard/project/pezisfaeecgjdguneuip/settings/functions

3. **Agregar Secrets**:
   - Ve a la sección **"Secrets"** o **"Environment Variables"**
   - Click en **"Add new secret"** o **"+ Add secret"**
   - Agrega cada variable una por una:
     - **Name**: `SUPABASE_URL`
     - **Value**: `https://pezisfaeecgjdguneuip.supabase.co`
     - Click en **"Add"**
   
   Repite para las otras 3 variables:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

4. **Verificar**:
   - Debes ver las 4 variables listadas en la sección Secrets
   - Todas deben estar activas/visibles

---

## ✅ Checklist de Configuración

### Edge Functions
- [x] `stripe-checkout` desplegada
- [x] `stripe-webhook` desplegada
- [x] `stripe-portal` desplegada

### Variables de Entorno
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `STRIPE_SECRET_KEY` configurada
- [ ] `STRIPE_WEBHOOK_SECRET` configurada

---

## 🧪 Después de Configurar - Probar

Una vez configuradas todas las variables:

1. **Ejecutar el frontend**:
   ```bash
   npm run dev
   ```

2. **Probar el flujo completo**:
   - Registrarse en la aplicación
   - Iniciar sesión
   - Ir a `/pricing`
   - Hacer clic en "Subscribe Now"
   - Usar tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura (ej: `12/34`)
   - CVC: cualquier 3 dígitos (ej: `123`)

3. **Verificar que funciona**:
   - ✅ Debe redirigir a Stripe Checkout
   - ✅ Después del pago, debe redirigir a `/success`
   - ✅ El webhook debe actualizar la suscripción en la base de datos
   - ✅ El perfil del usuario debe mostrar `subscription_status: 'active'`

4. **Crear usuario admin**:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'tu_email@ejemplo.com';
   ```

---

## 🔍 Verificar que Funciona

### En Supabase Dashboard:
1. Ve a **Edge Functions** → **Logs**
2. Intenta hacer una suscripción
3. Debes ver logs en `stripe-checkout` y `stripe-webhook`

### En Stripe Dashboard:
1. Ve a **Webhooks** → Tu endpoint
2. Click en **"Events"**
3. Debes ver eventos recibidos cuando se complete un checkout

### En Base de Datos:
```sql
-- Verificar suscripciones creadas
SELECT * FROM stripe_subscriptions;

-- Verificar perfiles actualizados
SELECT id, email, subscription_status, stripe_customer_id 
FROM profiles 
WHERE subscription_status = 'active';
```

---

## 🆘 Si Hay Problemas

1. **Verificar Variables**:
   - ¿Están todas configuradas en Edge Functions Settings?
   - ¿No tienen espacios extra?
   - ¿Los nombres están en mayúsculas correctamente?

2. **Revisar Logs**:
   - Supabase Dashboard → Edge Functions → Logs
   - Busca errores específicos

3. **Verificar Webhook**:
   - Stripe Dashboard → Webhooks → Tu endpoint
   - Verifica que esté recibiendo eventos
   - Revisa si hay errores en los intentos de entrega

4. **Verificar Base de Datos**:
   - ¿Las tablas existen?
   - ¿RLS está habilitado?
   - ¿Hay datos de prueba?

---

¡Ya casi está todo listo! Solo falta configurar estas 4 variables en Edge Functions Settings y tu aplicación estará completamente funcional. 🚀

