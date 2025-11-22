# 🚀 Guía Completa: Pasar a Producción y Actualizar Stripe

## 📋 Checklist Pre-Producción

Antes de comenzar, asegúrate de tener:
- [ ] Cuenta de Stripe activa y verificada
- [ ] Información bancaria configurada en Stripe
- [ ] Todas las Edge Functions desplegadas
- [ ] Código subido a Git
- [ ] Acceso al Dashboard de Vercel
- [ ] Acceso al Dashboard de Supabase

---

## 🔄 Paso 1: Cambiar Stripe a Modo Producción

### 1.1 Activar Modo Live en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. En la esquina superior derecha, cambia el toggle de **"Test mode"** a **"Live mode"**
3. Confirma el cambio

### 1.2 Obtener Claves de Producción

1. Ve a: **Developers** → **API keys**
2. Asegúrate de estar en **"Live mode"** (no Test mode)
3. Copia las siguientes claves:
   - **Secret key**: `sk_live_...` (empieza con `sk_live_`)
   - **Publishable key**: `pk_live_...` (empieza con `pk_live_`)

⚠️ **IMPORTANTE**: Guarda estas claves en un lugar seguro. Son diferentes a las de test.

---

## 💳 Paso 2: Crear Producto y Precio en Producción

### 2.1 Crear Producto en Modo Live

1. En Stripe Dashboard (modo Live), ve a: **Products** → **Add product**
2. Configura el producto:
   - **Nombre**: "Señales VIP Trading Sin Perdidas" (o el nombre que prefieras)
   - **Description**: "Acceso completo a señales VIP de trading..."
   - **Type**: **Recurring** (Suscripción)
3. Configura el precio:
   - **Price**: `15.00` (o el precio que desees)
   - **Billing period**: Monthly
   - **Currency**: USD
4. **Copia el Price ID** que se genera (ej: `price_1ABC...`)
   - ⚠️ Este será diferente al de test

### 2.2 Actualizar Price ID en Base de Datos

Ejecuta esta query en Supabase SQL Editor:

```sql
-- Ver el Price ID actual
SELECT * FROM stripe_prices;

-- Actualizar con el nuevo Price ID de producción
UPDATE stripe_prices 
SET 
  price_id = 'price_1ABC...TU_PRICE_ID_DE_PRODUCCION',
  mode = 'live',
  is_active = true
WHERE id = (SELECT id FROM stripe_prices LIMIT 1);

-- O crear uno nuevo si prefieres mantener ambos
INSERT INTO stripe_prices (
  price_id,
  name,
  description,
  price,
  currency,
  currency_symbol,
  mode,
  is_active
) VALUES (
  'price_1ABC...TU_PRICE_ID_DE_PRODUCCION',
  'Señales VIP Trading Sin Perdidas',
  'Acceso completo a señales VIP de trading...',
  15.00,
  'usd',
  '$',
  'live',
  true
);
```

---

## 🔔 Paso 3: Configurar Webhook de Producción

### 3.1 Crear Endpoint de Webhook en Modo Live

1. En Stripe Dashboard (modo Live), ve a: **Developers** → **Webhooks**
2. Click en **"Add endpoint"**
3. Configura:
   - **Endpoint URL**: 
     ```
     https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-webhook
     ```
   - ⚠️ Reemplaza `pezisfaeecgjdguneuip` con tu Project ID si es diferente
4. Selecciona los eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.succeeded`
5. Click en **"Add endpoint"**

### 3.2 Obtener Webhook Secret de Producción

1. Click en el webhook que acabas de crear
2. En la sección **"Signing secret"**, click en **"Reveal"**
3. Copia el secret que empieza con `whsec_...`
   - ⚠️ Este será diferente al de test

---

## ⚙️ Paso 4: Actualizar Variables en Supabase Edge Functions

### 4.1 Actualizar Secrets en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium**
3. Ve a: **Edge Functions** → **Settings** → **Secrets**
4. Actualiza las siguientes variables:

#### Para TODAS las Edge Functions:
```env
SUPABASE_URL=https://pezisfaeecgjdguneuip.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
STRIPE_SECRET_KEY=sk_live_...TU_CLAVE_SECRETA_DE_PRODUCCION
```

#### Solo para `stripe-webhook`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...TU_WEBHOOK_SECRET_DE_PRODUCCION
```

5. **IMPORTANTE**: 
   - Si ya existen las variables, **edítalas** (no las dupliques)
   - Si no existen, **agréguelas**
   - Asegúrate de usar las claves de **PRODUCCIÓN** (no test)

### 4.2 Redesplegar Edge Functions (Recomendado)

Después de actualizar las variables, redespliega las Edge Functions:

```bash
# Desde tu máquina local
cd supabase/functions

# Redesplegar stripe-checkout
supabase functions deploy stripe-checkout

# Redesplegar stripe-webhook
supabase functions deploy stripe-webhook

# Redesplegar stripe-portal
supabase functions deploy stripe-portal
```

O desde Supabase Dashboard:
1. Ve a **Edge Functions**
2. Para cada función, click en **"Redeploy"** o **"Deploy"**

---

## 🌐 Paso 5: Actualizar Variables en Vercel (Frontend)

### 5.1 Configurar Variables de Entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a: **Settings** → **Environment Variables**
4. Actualiza o agrega:

```env
VITE_SUPABASE_URL=https://pezisfaeecgjdguneuip.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...TU_PUBLISHABLE_KEY_DE_PRODUCCION
```

⚠️ **IMPORTANTE**: 
- Usa `pk_live_...` (no `pk_test_...`)
- Después de actualizar, haz un **Redeploy**

### 5.2 Redesplegar en Vercel

1. En Vercel Dashboard, ve a **Deployments**
2. Click en los **3 puntos (...)** del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el despliegue

O desde la terminal:
```bash
vercel --prod
```

---

## 🔐 Paso 6: Configurar Stripe Billing Portal en Producción

1. En Stripe Dashboard (modo Live), ve a: **Settings** → **Billing** → **Customer portal**
2. Click en **"Activate"** (no "Activate test link")
3. Configura los permisos:
   - ✅ Permitir cancelar suscripciones
   - ✅ Permitir actualizar método de pago
   - ✅ Permitir ver historial de facturación
4. Guarda los cambios

---

## ✅ Paso 7: Verificar Configuración

### 7.1 Verificar Variables en Supabase

1. Ve a Supabase Dashboard → Edge Functions → Settings → Secrets
2. Verifica que todas las variables estén configuradas:
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `STRIPE_SECRET_KEY` (debe empezar con `sk_live_`)
   - ✅ `STRIPE_WEBHOOK_SECRET` (solo para stripe-webhook)

### 7.2 Verificar Variables en Vercel

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica:
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`
   - ✅ `VITE_STRIPE_PUBLISHABLE_KEY` (debe empezar con `pk_live_`)

### 7.3 Verificar Webhook en Stripe

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Verifica que el webhook de producción esté:
   - ✅ Activo
   - ✅ Con la URL correcta
   - ✅ Con los eventos correctos seleccionados

### 7.4 Probar en Producción

⚠️ **CUIDADO**: Esto procesará pagos reales

1. Ve a tu aplicación en producción
2. Intenta crear una suscripción con una tarjeta real
3. Verifica que:
   - ✅ El checkout funciona
   - ✅ El pago se procesa
   - ✅ El perfil se actualiza automáticamente
   - ✅ El webhook recibe los eventos (revisa logs en Stripe)

---

## 🔄 Paso 8: Mantener Modo Test para Desarrollo

### Recomendación: Mantener Ambos Modos

Puedes mantener las configuraciones de TEST y PRODUCCIÓN:

1. **En Supabase Edge Functions**: 
   - Puedes tener ambas variables (pero solo una activa)
   - O cambiar manualmente cuando necesites

2. **En Vercel**:
   - Puedes tener diferentes variables para diferentes entornos
   - Production: `pk_live_...`
   - Preview/Development: `pk_test_...`

3. **En Stripe**:
   - Usa el toggle en el Dashboard para cambiar entre Test y Live

---

## 📝 Resumen de Cambios Necesarios

| Componente | Variable | Valor de Producción |
|------------|---------|---------------------|
| **Supabase Edge Functions** | `STRIPE_SECRET_KEY` | `sk_live_...` |
| **Supabase Edge Functions** | `STRIPE_WEBHOOK_SECRET` | `whsec_...` (nuevo) |
| **Vercel (Frontend)** | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| **Base de Datos** | `stripe_prices.price_id` | `price_1ABC...` (nuevo) |
| **Stripe Dashboard** | Webhook URL | Misma (pero en modo Live) |

---

## ⚠️ Notas Importantes

1. **Backup**: Antes de cambiar a producción, haz backup de tu base de datos
2. **Testing**: Prueba primero con montos pequeños
3. **Monitoreo**: Revisa los logs de Stripe y Supabase después del cambio
4. **Seguridad**: Nunca compartas las claves de producción
5. **Rollback**: Si algo sale mal, puedes volver a modo test cambiando las variables

---

## 🆘 Solución de Problemas

### Error: "Invalid API key"
- Verifica que estés usando claves de **producción** (`sk_live_`, `pk_live_`)
- Verifica que no haya espacios extra al copiar

### Webhook no recibe eventos
- Verifica que el webhook esté en modo **Live** (no Test)
- Verifica que la URL sea correcta
- Revisa los logs en Supabase Edge Functions

### Suscripción no se sincroniza
- Verifica que el `STRIPE_WEBHOOK_SECRET` sea el correcto (de producción)
- Verifica que los eventos estén seleccionados en Stripe
- Revisa los logs del webhook

### Checkout no funciona
- Verifica que `VITE_STRIPE_PUBLISHABLE_KEY` sea de producción (`pk_live_`)
- Verifica que el Price ID sea el correcto en la base de datos
- Revisa la consola del navegador para errores

---

## ✅ Checklist Final

- [ ] Stripe cambiado a modo Live
- [ ] Claves de producción obtenidas (`sk_live_`, `pk_live_`)
- [ ] Producto y precio creados en producción
- [ ] Price ID actualizado en base de datos
- [ ] Webhook de producción configurado
- [ ] Webhook Secret de producción obtenido
- [ ] Variables actualizadas en Supabase Edge Functions
- [ ] Edge Functions redesplegadas
- [ ] Variables actualizadas en Vercel
- [ ] Vercel redesplegado
- [ ] Billing Portal activado en producción
- [ ] Pruebas realizadas (con cuidado)
- [ ] Todo funcionando correctamente

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará en producción y procesando pagos reales.

**Recuerda**: Monitorea los primeros pagos y revisa los logs regularmente.


