# 💰 Configurar Pagos en Moneda Local (MXN para México)

## 🎯 Objetivo
Permitir que los clientes mexicanos paguen en MXN (pesos mexicanos) en lugar de USD.

## 📋 Solución: Crear Precio en MXN en Stripe

### Paso 1: Crear Precio en MXN en Stripe

1. Ve a **Stripe Dashboard** → **Products** → **"Acceso a Apps Premium"**
2. Haz clic en **"+ Agregar otro precio"** o **"+ Add another price"**
3. Configura el nuevo precio:
   - **Pricing model**: Recurring (Recurrente)
   - **Price**: `350.00` (aproximadamente $20 USD en MXN, ajusta según el tipo de cambio)
   - **Currency**: **MXN** (¡IMPORTANTE! Selecciona MXN, no USD)
   - **Billing period**: Monthly (Mensual)
   - **Description**: "Apps Premium y Señales (MXN)"
4. Haz clic en **"Add price"** o **"Agregar precio"**
5. **Copia el nuevo Price ID** (se verá como `price_1XXXXX...`)

### Paso 2: Agregar el Precio en MXN a la Base de Datos

Ejecuta este SQL en Supabase Dashboard → SQL Editor:

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
  'tu_price_id_mxn_aqui',  -- Reemplaza con el Price ID de MXN que copiaste
  'Acceso a Apps Premium',
  'Apps Premium y Señales (MXN)',
  350.00,  -- Ajusta según el tipo de cambio actual
  'mxn',
  '$',
  'subscription',
  true
);
```

### Paso 3: Actualizar el Código para Detectar Moneda

El código necesita detectar la moneda del cliente y usar el precio correspondiente. Esto se puede hacer de dos formas:

**Opción A: Detectar por ubicación del cliente** (Recomendado)
- Detectar el país del cliente desde su navegador o IP
- Si es México → usar precio MXN
- Si es otro país → usar precio USD

**Opción B: Permitir que el cliente elija**
- Mostrar opciones de moneda en el frontend
- El cliente selecciona USD o MXN
- Usar el precio correspondiente

## 🔧 Configuración en Stripe Dashboard

### Habilitar Conversión Automática (Opcional)

Si quieres que Stripe convierta automáticamente USD a MXN:

1. Ve a **Settings** → **Checkout** → **Checkout settings**
2. Busca **"Currency conversion"** o **"Conversión de moneda"**
3. **ACTÍVALA** (si no está activada)
4. Esto permitirá que Stripe muestre y procese pagos en la moneda local del cliente

### Verificar Métodos de Pago

1. Ve a **Settings** → **Payment methods** → **Cards**
2. Verifica que acepta pagos de **México**
3. Verifica que **MXN** esté en las monedas soportadas

## 💡 Tipo de Cambio Aproximado

- $20 USD ≈ $350-400 MXN (varía según el tipo de cambio)
- Verifica el tipo de cambio actual en: https://www.xe.com/
- Ajusta el precio en MXN según el tipo de cambio actual

## ✅ Checklist

- [ ] Precio en MXN creado en Stripe
- [ ] Price ID de MXN copiado
- [ ] Precio en MXN agregado a la base de datos
- [ ] Código actualizado para detectar/permite seleccionar moneda
- [ ] Conversión automática habilitada (si usas esa opción)
- [ ] Métodos de pago verificados para México

## 🧪 Probar

1. Intenta hacer un checkout desde México (o con VPN)
2. Verifica que el precio se muestre en MXN
3. Completa el pago con una tarjeta de prueba
4. Verifica en Stripe Dashboard → Payments que el pago se procesó en MXN

