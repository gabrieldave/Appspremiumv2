# Guía para Reusar Stripe Existente

## ✅ Sí, Puedes Reusar Todo

Si ya tienes una cuenta de Stripe con productos, puedes reusar:
- ✅ Las mismas claves API (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
- ✅ La misma cuenta de Stripe
- ✅ Productos y precios existentes (opcional)
- ✅ La misma configuración de Billing Portal

## ⚠️ Lo Que Necesitas Configurar Específicamente

### 1. Webhook (Específico para este Proyecto)

Cada proyecto necesita su propio endpoint de webhook:

**Para AppsPremium:**
```
https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-webhook
```

**Pasos:**
1. Ve a Stripe Dashboard → Webhooks → Add endpoint
2. Agrega la URL de arriba
3. Selecciona los eventos necesarios
4. Copia el Webhook Secret específico de este endpoint

**Importante:**
- Puedes tener múltiples webhooks en la misma cuenta
- Cada webhook debe apuntar a su propio proyecto
- El Webhook Secret será diferente para cada endpoint

---

## 🔄 Opciones para Productos

### Opción 1: Usar Producto Existente

Si ya tienes un producto/precio que quieres usar:

1. **En Stripe Dashboard:**
   - Ve a Products
   - Encuentra el producto que quieres usar
   - Copia el **Price ID** (empieza con `price_...`)

2. **En tu Base de Datos:**
   ```sql
   -- Actualizar el Price ID existente
   UPDATE stripe_prices 
   SET price_id = 'tu_price_id_existente_de_stripe',
       name = 'Nombre del Producto Existente',
       description = 'Descripción del Producto',
       price = 15.00  -- Actualiza con el precio correcto
   WHERE price_id = 'price_1SRFznG2B99hBCya4vFOfnbY';
   ```

   O crear un nuevo registro:
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
     'tu_price_id_existente',
     'Nombre del Producto',
     'Descripción',
     15.00,
     'usd',
     '$',
     'subscription',
     true
   );
   ```

### Opción 2: Crear Nuevo Producto

Si prefieres crear un producto específico para AppsPremium:

1. Crea el producto en Stripe como se explica en `CONFIGURACION_STRIPE.md`
2. Usa el nuevo Price ID en la base de datos

---

## 🔑 Configuración de Claves

### En Supabase Edge Functions:

Usa las mismas claves que ya tienes:

```env
# Estas son las mismas que usas en otros proyectos
STRIPE_SECRET_KEY=sk_test_...o_sk_live_... (tu clave existente)

# Esta es nueva, específica para este webhook
STRIPE_WEBHOOK_SECRET=whsec_... (del nuevo webhook que crees)

# Estas son específicas de Supabase
SUPABASE_URL=https://pezisfaeecgjdguneuip.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

## 📋 Checklist Simplificado

Si ya tienes Stripe configurado:

- [ ] ✅ Usar `STRIPE_SECRET_KEY` existente (no necesitas crear nueva)
- [ ] ⚠️ Crear nuevo webhook específico para este proyecto
- [ ] ⚠️ Obtener nuevo `STRIPE_WEBHOOK_SECRET` del webhook
- [ ] 🔄 Decidir: ¿Usar producto existente o crear nuevo?
- [ ] ⚠️ Actualizar Price ID en base de datos
- [ ] ✅ Usar misma configuración de Billing Portal
- [ ] ⚠️ Configurar variables en Edge Functions de Supabase

---

## 💡 Ventajas de Reusar

1. **Gestión centralizada**: Todos los productos en una cuenta
2. **Reportes unificados**: Ver todo en un solo lugar
3. **Facturación simplificada**: Una sola cuenta de Stripe
4. **Mantenimiento fácil**: Actualizar claves una sola vez

---

## ⚠️ Consideraciones

### Modo Test vs Producción:
- Si tu cuenta existente está en modo **PRODUCCIÓN** (`sk_live_...`), ten cuidado al probar
- Puedes crear una clave de TEST adicional para desarrollo
- O usar la misma en ambos ambientes si estás seguro

### Webhooks:
- Cada proyecto necesita su propio webhook
- No compartas el mismo webhook entre proyectos
- Cada webhook tiene su propio `STRIPE_WEBHOOK_SECRET`

### Productos:
- Puedes usar los mismos productos en múltiples proyectos
- O crear productos específicos para cada proyecto
- La decisión depende de tu modelo de negocio

---

## 🚀 Pasos Rápidos

1. **Ya tienes**: `STRIPE_SECRET_KEY` ✅
2. **Necesitas crear**: Webhook nuevo para AppsPremium
3. **Decide**: ¿Producto existente o nuevo?
4. **Actualiza**: Price ID en base de datos
5. **Configura**: Variables en Edge Functions

