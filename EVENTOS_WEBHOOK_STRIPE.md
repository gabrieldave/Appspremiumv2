# 🔔 Eventos del Webhook de Stripe

## 📋 Eventos Requeridos para AppsPremium

Para que el sistema funcione correctamente, selecciona estos eventos en tu webhook de Stripe:

---

## ✅ Eventos Esenciales (Seleccionar Todos)

### 1. Checkout Events
- ✅ `checkout.session.completed`
  - **Cuándo**: Cuando un usuario completa el checkout (pago único o suscripción)
  - **Usado para**: Procesar el pago y crear/actualizar la suscripción

### 2. Subscription Events
- ✅ `customer.subscription.created`
  - **Cuándo**: Cuando se crea una nueva suscripción
  - **Usado para**: Inicializar el registro de suscripción en la base de datos

- ✅ `customer.subscription.updated`
  - **Cuándo**: Cuando se actualiza una suscripción (cambio de plan, renovación, etc.)
  - **Usado para**: Sincronizar cambios en el estado de la suscripción

- ✅ `customer.subscription.deleted`
  - **Cuándo**: Cuando se cancela o elimina una suscripción
  - **Usado para**: Actualizar el estado a "canceled" o "inactive"

### 3. Payment Events
- ✅ `payment_intent.succeeded`
  - **Cuándo**: Cuando un pago se completa exitosamente
  - **Usado para**: Procesar pagos únicos (solo cuando no hay invoice asociado)

---

## 🎯 Forma Rápida de Seleccionar

### Opción 1: Selección Manual (Recomendado)

En Stripe Dashboard → Webhooks → Tu Endpoint → **"Select events"**

Busca y selecciona estos eventos específicos:

```
☑️ checkout.session.completed
☑️ customer.subscription.created
☑️ customer.subscription.updated
☑️ customer.subscription.deleted
☑️ payment_intent.succeeded
```

### Opción 2: Selección por Categoría (Más Incluyente)

Si prefieres ser más inclusivo, puedes seleccionar:

**Categoría: Checkout**
- ✅ `checkout.session.completed`

**Categoría: Customer Subscription**
- ✅ Todos los eventos de `customer.subscription.*` (incluye created, updated, deleted, etc.)

**Categoría: Payments**
- ✅ `payment_intent.succeeded`

---

## 📝 Lista Completa para Copiar/Referencia

```
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
payment_intent.succeeded
```

---

## 🔍 Eventos Adicionales Opcionales (No Requeridos)

Estos eventos pueden ser útiles para monitoreo y debugging, pero no son esenciales:

- `customer.subscription.trial_will_end` - Notificar antes de que termine el período de prueba
- `invoice.payment_succeeded` - Cuando se cobra una factura exitosamente
- `invoice.payment_failed` - Cuando falla un pago de factura
- `customer.subscription.paused` - Cuando se pausa una suscripción
- `customer.subscription.resumed` - Cuando se reanuda una suscripción

---

## ⚠️ Eventos a NO Seleccionar (Evitar)

- ❌ `checkout.session.async_payment_succeeded` (para pagos asíncronos, no necesario para este proyecto)
- ❌ `checkout.session.async_payment_failed` (para pagos asíncronos)
- ❌ Eventos de `payment_method.*` (no se usan en este proyecto)
- ❌ Eventos de `charge.*` (reemplazados por payment_intent)

---

## 🚀 Pasos para Configurar en Stripe Dashboard

1. **Ve a Stripe Dashboard**:
   - [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

2. **Crea o Edita el Endpoint**:
   - Si es nuevo: Click en **"Add endpoint"**
   - Si ya existe: Click en tu endpoint → **"Settings"**

3. **Configura la URL**:
   ```
   https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-webhook
   ```

4. **Selecciona Eventos**:
   - Click en **"Select events"** o **"Select events to listen to"**
   - Busca cada evento en la lista
   - O usa la búsqueda para encontrarlos rápidamente

5. **Guarda y Obtén el Secret**:
   - Click en **"Add endpoint"** o **"Save"**
   - Después de crear, copia el **"Signing secret"** (empieza con `whsec_...`)

---

## ✅ Checklist de Eventos

Asegúrate de tener estos 5 eventos seleccionados:

- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `payment_intent.succeeded`

---

## 🔍 Verificar Eventos Seleccionados

Después de configurar, puedes verificar:

1. En Stripe Dashboard → Webhooks → Tu Endpoint
2. Ve a la sección **"Events"** o **"Selected events"**
3. Debe mostrar los 5 eventos listados arriba

---

## 🧪 Probar el Webhook

Una vez configurado:

1. En Stripe Dashboard → Webhooks → Tu Endpoint
2. Click en **"Send test webhook"**
3. Selecciona `checkout.session.completed` como evento de prueba
4. Verifica que la Edge Function recibe el evento en Supabase Dashboard → Edge Functions → Logs

---

## 📊 Flujo de Eventos

```
Usuario completa checkout
    ↓
checkout.session.completed
    ↓
customer.subscription.created (si es suscripción)
    ↓
customer.subscription.updated (renovaciones, cambios)
    ↓
customer.subscription.deleted (si cancela)
```

---

## 💡 Notas Importantes

1. **Eventos Duplicados**: Si seleccionas `customer.subscription.*`, obtendrás todos los eventos de suscripciones, incluyendo los esenciales.

2. **Orden Importante**: El orden de selección no importa, Stripe enviará los eventos cuando ocurran.

3. **Múltiples Webhooks**: Puedes tener múltiples endpoints webhook escuchando los mismos eventos.

4. **Testing**: Usa el modo TEST de Stripe para probar sin cobrar dinero real.

---

## 🆘 Si Falta un Evento

Si no seleccionas algún evento esencial, notarás que:
- Las suscripciones no se crean automáticamente
- Los cambios de estado no se sincronizan
- El perfil del usuario no se actualiza

**Solución**: Agrega los eventos faltantes al webhook.

