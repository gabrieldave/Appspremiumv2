# 🔍 Cómo Verificar y Corregir el Precio en Stripe

## 📋 Problema
Los clientes mexicanos están pagando en MXN en lugar de USD.

## ✅ Solución Paso a Paso

### Paso 1: Verificar el Precio Actual en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. En el menú lateral, haz clic en **"Products"** (Productos)
3. Busca tu producto: **"Señales VIP Trading Sin Perdidas"**
4. Haz clic en el producto
5. Verás una lista de precios. Busca el precio con ID: `price_1SRejEG2B99hBCyaNTpL8x3I`
6. **VERIFICA**:
   - ¿Qué moneda muestra? (USD o MXN)
   - ¿Cuál es el monto?

### Paso 2A: Si el Precio está en MXN ❌

**Necesitas crear un nuevo precio en USD:**

1. En la página del producto, haz clic en **"Add another price"** o **"Agregar otro precio"**
2. Configura:
   - **Pricing model**: Recurring (Recurrente)
   - **Price**: `20.00`
   - **Currency**: **USD** (¡IMPORTANTE! Selecciona USD, no MXN)
   - **Billing period**: Monthly (Mensual)
3. Haz clic en **"Add price"** o **"Agregar precio"**
4. **Copia el nuevo Price ID** (se verá como `price_1XXXXX...`)
5. **Actualiza tu base de datos** con el nuevo Price ID

### Paso 2B: Si el Precio está en USD ✅

**El problema puede ser la conversión automática:**

1. Ve a **Settings** → **Checkout** → **Checkout settings**
2. Busca estas opciones y **DESACTÍVALAS**:
   - "Currency conversion" (Conversión de moneda)
   - "Localized pricing" (Precios localizados)
   - "Show prices in customer's currency" (Mostrar precios en la moneda del cliente)
3. Guarda los cambios

### Paso 3: Actualizar el Price ID en la Base de Datos

Si creaste un nuevo precio en USD, actualiza la base de datos:

```sql
UPDATE stripe_prices 
SET price_id = 'tu_nuevo_price_id_en_usd'
WHERE price_id = 'price_1SRejEG2B99hBCyaNTpL8x3I';
```

O ejecuta esto desde Supabase Dashboard → SQL Editor.

## 🔍 Cómo Encontrar la Configuración de Checkout

Si no encuentras "Payment methods", busca estas secciones:

1. **Settings** (Configuración) → **Checkout** → **Checkout settings**
   - Aquí encontrarás opciones de conversión de moneda

2. **Settings** → **Payment methods**
   - Si no lo ves, puede que esté en otra ubicación según tu versión de Stripe

3. **Settings** → **Account** → **Business settings**
   - Verifica que tu cuenta esté completamente activada

## ⚠️ Importante

- **NO mezcles precios en USD y MXN** - Usa solo USD
- **Desactiva la conversión automática** si quieres forzar USD
- **Verifica que el Price ID en tu base de datos coincida** con el precio en USD en Stripe

## 🧪 Probar

Después de hacer los cambios:
1. Intenta hacer un checkout desde tu aplicación
2. Verifica que el precio se muestre en USD
3. Completa el pago con una tarjeta de prueba
4. Verifica en Stripe Dashboard → Payments que el pago se procesó en USD

