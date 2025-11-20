# Guía Completa de Configuración de Stripe para AppsPremium

## 📋 Requisitos de Stripe

Para que el proyecto funcione completamente, necesitas configurar lo siguiente en Stripe:

---

## 🔑 1. Claves API de Stripe

### Obtener las Claves:
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click en **Developers** → **API keys**
3. **Claves necesarias**:
   - **STRIPE_SECRET_KEY**: `sk_test_...` (modo test) o `sk_live_...` (producción)
     - Esta es la clave SECRETA, nunca debe exponerse al frontend
     - Se usará en las Edge Functions
   - **STRIPE_PUBLISHABLE_KEY**: `pk_test_...` (opcional, solo si se usa en frontend)

### ⚠️ Importante:
- Usa **modo TEST** para desarrollo
- Las claves de TEST empiezan con `sk_test_` y `pk_test_`
- Las claves de PRODUCCIÓN empiezan con `sk_live_` y `pk_live_`

---

## 💳 2. Crear Producto y Precio en Stripe

### Paso a Paso:

1. **Crear Producto**:
   - Ve a: **Products** → **Add product**
   - **Nombre**: "Señales VIP Trading Sin Perdidas"
   - **Descripción**: "Acceso completo a señales VIP de trading con estrategias probadas para maximizar ganancias y minimizar pérdidas."
   - **Tipo**: Selecciona **"Recurring"** (Suscripción recurrente)

2. **Configurar Precio**:
   - **Pricing model**: Recurring
   - **Price**: `15.00` (o el precio que desees)
   - **Billing period**: Monthly (Mensual)
   - **Currency**: USD (o la moneda que prefieras)

3. **Obtener Price ID**:
   - Después de crear, copia el **Price ID** 
   - Se verá como: `price_1SRFznG2B99hBCya4vFOfnbY`
   - ⚠️ **IMPORTANTE**: Guarda este ID, lo necesitarás para actualizar la base de datos

4. **Actualizar en Base de Datos**:
   - El proyecto ya tiene un Price ID de ejemplo: `price_1SRFznG2B99hBCya4vFOfnbY`
   - Debes actualizarlo con tu Price ID real de Stripe
   - O crear un nuevo registro en la tabla `stripe_prices` con tu Price ID

---

## 🔐 3. Configurar Stripe Billing Portal

**Requerido para la función `stripe-portal`** que permite a usuarios gestionar sus suscripciones.

### Pasos:
1. Ve a: **Settings** → **Billing** → **Customer portal**
2. Click en **"Activate test link"** (para modo test) o **"Activate"** (para producción)
3. **Configurar permisos**:
   - ✅ Permitir cancelar suscripciones
   - ✅ Permitir actualizar método de pago
   - ✅ Permitir ver historial de facturación
   - Configura según tus necesidades

---

## 🔔 4. Configurar Webhook de Stripe

**CRÍTICO**: Necesario para sincronizar suscripciones automáticamente con la base de datos.

### Pasos:

1. **Crear Endpoint**:
   - Ve a: **Developers** → **Webhooks** → **Add endpoint**
   
2. **Configurar URL**:
   ```
   https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-webhook
   ```
   ⚠️ Reemplaza `pezisfaeecgjdguneuip` con tu proyecto ID si es diferente

3. **Seleccionar Eventos**:
   Selecciona estos eventos específicos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.succeeded`
   - ✅ También puedes seleccionar: **"Select events"** → buscar y seleccionar todos los eventos de `customer.subscription.*`

4. **Obtener Webhook Secret**:
   - Después de crear el webhook, click en el endpoint creado
   - Ve a la sección **"Signing secret"**
   - Click en **"Reveal"** o **"Click to reveal"**
   - Copia el secret que empieza con `whsec_...`
   - ⚠️ **IMPORTANTE**: Este será tu `STRIPE_WEBHOOK_SECRET`

---

## ⚙️ 5. Configurar Variables de Entorno en Supabase Edge Functions

Una vez tengas todas las claves de Stripe:

### En Supabase Dashboard:
1. Ve a: **Edge Functions** → **Settings**
2. En la sección **"Secrets"**, agrega estas variables:

```env
SUPABASE_URL=https://pezisfaeecgjdguneuip.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
STRIPE_SECRET_KEY=sk_test_...tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_...tu_webhook_secret
```

⚠️ **IMPORTANTE**: 
- `STRIPE_WEBHOOK_SECRET` solo es necesario para la función `stripe-webhook`
- Las otras 3 variables son necesarias para todas las Edge Functions

---

## 📝 6. Actualizar Price ID en Base de Datos

Después de crear el producto en Stripe, actualiza el Price ID en tu base de datos:

### Opción 1: Actualizar el existente (recomendado)
```sql
UPDATE stripe_prices 
SET price_id = 'tu_price_id_real_de_stripe'
WHERE price_id = 'price_1SRFznG2B99hBCya4vFOfnbY';
```

### Opción 2: Crear nuevo registro
```sql
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
  'tu_price_id_real_de_stripe',
  'Señales VIP Trading Sin Perdidas',
  'Acceso completo a señales VIP de trading...',
  15.00,
  'usd',
  '$',
  'subscription',
  true
);
```

---

## ✅ Checklist de Configuración de Stripe

### Cuenta y Claves
- [ ] Cuenta de Stripe creada
- [ ] Modo TEST activado para desarrollo
- [ ] `STRIPE_SECRET_KEY` obtenida
- [ ] `STRIPE_PUBLISHABLE_KEY` obtenida (opcional)

### Producto y Precio
- [ ] Producto creado en Stripe
- [ ] Precio configurado (mensual, $15 USD)
- [ ] Price ID copiado y guardado
- [ ] Price ID actualizado en base de datos

### Billing Portal
- [ ] Billing Portal activado
- [ ] Permisos configurados (cancelar, actualizar método de pago, etc.)

### Webhook
- [ ] Endpoint de webhook creado
- [ ] URL configurada correctamente
- [ ] Eventos seleccionados (checkout.session.completed, customer.subscription.*, etc.)
- [ ] Webhook Secret obtenido (`whsec_...`)
- [ ] Webhook probado (Stripe envía eventos de prueba)

### Edge Functions
- [ ] `SUPABASE_URL` configurada en Edge Functions
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada en Edge Functions
- [ ] `STRIPE_SECRET_KEY` configurada en Edge Functions
- [ ] `STRIPE_WEBHOOK_SECRET` configurada solo en stripe-webhook

---

## 🧪 7. Probar la Configuración

### Test de Webhook:
1. En Stripe Dashboard → Webhooks → Tu endpoint
2. Click en **"Send test webhook"**
3. Selecciona un evento (ej: `checkout.session.completed`)
4. Verifica que la Edge Function recibe el evento correctamente

### Test de Checkout:
1. Inicia sesión en tu aplicación
2. Intenta suscribirte
3. Usa una tarjeta de prueba de Stripe: `4242 4242 4242 4242`
4. Verifica que la suscripción se crea correctamente
5. Verifica que el perfil se actualiza automáticamente

---

## 🔗 Enlaces Útiles

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe Billing Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

## 💡 Tarjetas de Prueba de Stripe

Para probar pagos sin usar dinero real:

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Tarjeta rechazada |
| `4000 0025 0000 3155` | Requiere autenticación (3D Secure) |

**Fecha**: Cualquier fecha futura (ej: `12/34`)  
**CVC**: Cualquier 3 dígitos (ej: `123`)  
**ZIP**: Cualquier código postal (ej: `12345`)

---

## ⚠️ Notas Importantes

1. **Modo Test vs Producción**:
   - Usa modo TEST para desarrollo
   - Cambia a modo PRODUCCIÓN cuando estés listo para lanzar
   - Las claves son diferentes para cada modo

2. **Seguridad**:
   - NUNCA expongas `STRIPE_SECRET_KEY` en el frontend
   - NUNCA expongas `STRIPE_WEBHOOK_SECRET` en el frontend
   - Solo se usan en Edge Functions de Supabase

3. **Webhook URL**:
   - Asegúrate de que la URL del webhook sea accesible públicamente
   - Verifica que no haya errores en los logs de Edge Functions

4. **Price ID**:
   - Cada producto/precio en Stripe tiene un ID único
   - Si creas un nuevo precio, actualiza la base de datos
   - El Price ID es diferente en modo test y producción

---

## 🆘 Problemas Comunes

### Webhook no recibe eventos:
- Verifica que la URL sea correcta
- Verifica que las Edge Functions estén desplegadas
- Revisa los logs en Supabase Dashboard → Edge Functions → Logs

### Suscripción no se sincroniza:
- Verifica que el webhook esté configurado correctamente
- Verifica que los eventos correctos estén seleccionados
- Revisa los logs del webhook en Stripe Dashboard

### Error en checkout:
- Verifica que el Price ID sea correcto
- Verifica que las claves de Stripe sean correctas
- Verifica que la Edge Function `stripe-checkout` esté desplegada

