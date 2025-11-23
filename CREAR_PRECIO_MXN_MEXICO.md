# 🇲🇽 Crear Precio en MXN para Clientes Mexicanos

## 🔍 Problema
Los clientes mexicanos **NO pueden pagar** porque sus tarjetas no aceptan USD. El error dice: **"Tu tarjeta no admite esta divisa"**.

## ✅ Solución
Crear un precio en **MXN** (pesos mexicanos) en Stripe y el código lo usará automáticamente para clientes mexicanos.

## 📋 Paso 1: Crear Precio en MXN en Stripe

1. Ve a **Stripe Dashboard** → **Products** → **"Acceso a Apps Premium"**
2. Haz clic en **"+ Agregar otro precio"** o **"+ Add another price"**
3. Configura el nuevo precio:
   - **Pricing model**: Recurring (Recurrente)
   - **Price**: `350.00` (aproximadamente $20 USD, ajusta según tipo de cambio)
   - **Currency**: **MXN** (¡IMPORTANTE! Selecciona MXN, no USD)
   - **Billing period**: Monthly (Mensual)
   - **Description**: "Apps Premium y Señales (MXN)"
4. Haz clic en **"Add price"** o **"Agregar precio"**
5. **Copia el nuevo Price ID** (se verá como `price_1XXXXX...`)

## 📋 Paso 2: Agregar el Precio en MXN a la Base de Datos

Ejecuta este SQL en **Supabase Dashboard** → **SQL Editor**:

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
  350.00,  -- Ajusta según el tipo de cambio actual ($20 USD ≈ $350-400 MXN)
  'mxn',
  '$',
  'subscription',
  true
);
```

**⚠️ IMPORTANTE**: Reemplaza `'tu_price_id_mxn_aqui'` con el Price ID real que copiaste de Stripe.

## 💡 Tipo de Cambio Aproximado

- $20 USD ≈ $350-400 MXN (varía según el tipo de cambio)
- Verifica el tipo de cambio actual en: https://www.xe.com/
- Ajusta el precio en MXN según el tipo de cambio actual

## ✅ Cómo Funciona

Una vez que agregues el precio en MXN:

1. **Cliente mexicano** intenta pagar:
   - El código detecta que es de México (desde timezone o locale)
   - Busca automáticamente un precio en MXN
   - Si lo encuentra, usa ese precio
   - El cliente ve y paga en **MXN** (~$350 MXN)

2. **Cliente de otro país**:
   - El código usa el precio en USD
   - El cliente ve y paga en **USD** ($20 USD)

## 🧪 Probar

Después de crear el precio en MXN y agregarlo a la base de datos:

1. **Desde México** (o con VPN en México):
   - Intenta hacer un checkout
   - Deberías ver el precio en **MXN** (~$350 MXN)
   - Completa el pago
   - Verifica en Stripe Dashboard → Payments que el pago se procesó en **MXN**

## 📝 Checklist

- [ ] Precio en MXN creado en Stripe
- [ ] Price ID de MXN copiado
- [ ] Precio en MXN agregado a la base de datos (usando el SQL de arriba)
- [ ] Código actualizado (ya está hecho)
- [ ] Probado desde México

## 🆘 Si Tienes Problemas

Si después de crear el precio en MXN los clientes mexicanos aún no pueden pagar:

1. Verifica que el Price ID en la base de datos sea correcto
2. Verifica que el precio en Stripe esté **activo**
3. Verifica que la moneda sea **MXN** (no USD)
4. Revisa los logs en Supabase Dashboard → Edge Functions → stripe-checkout → Logs

