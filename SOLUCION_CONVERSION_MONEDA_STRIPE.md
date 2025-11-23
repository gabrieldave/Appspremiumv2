# 💱 Solución: Habilitar Conversión Automática de Moneda en Stripe

## 🔍 Problema Actual
El checkout sigue mostrando **USD 20.00** en lugar de convertir automáticamente a MXN para clientes mexicanos.

## ⚠️ Importante
La conversión automática de moneda **NO se puede habilitar desde el código**. Debe habilitarse desde **Stripe Dashboard**.

## 📋 Opción 1: Habilitar desde Stripe Dashboard (Recomendado)

### Método A: Buscar en Configuración

1. Ve a **Stripe Dashboard**: https://dashboard.stripe.com/
2. En la **esquina superior derecha**, haz clic en tu **ícono de perfil** o **nombre**
3. En el menú desplegable, busca **"Settings"** o **"Configuración"**
4. Dentro de Settings, busca **"Checkout"** o **"Pago"**
5. Busca la sección **"Currency conversion"** o **"Conversión de moneda"**
6. **ACTÍVALA** si está desactivada
7. Guarda los cambios

### Método B: URL Directa

Intenta ir directamente a estas URLs:

- `https://dashboard.stripe.com/settings/checkout`
- `https://dashboard.stripe.com/settings/payment_methods`

### Método C: Buscar en "Checkout y Payment Links"

1. Ve a **Configuración** → **Pagos** → **"Checkout y Payment Links"**
2. Busca opciones relacionadas con:
   - "Currency conversion"
   - "Localized pricing"
   - "Show prices in customer's currency"

## 📋 Opción 2: Contactar a Stripe Support

Si no encuentras la opción:

1. Ve a: https://support.stripe.com/
2. Haz clic en **"Contact Support"** o **"Contactar Soporte"**
3. Explica:
   > "Necesito habilitar la conversión automática de moneda para que los clientes puedan pagar en su moneda local (MXN para México). Mi precio base está en USD ($20 USD) pero quiero que los clientes mexicanos vean y paguen en MXN. ¿Dónde puedo encontrar esta configuración en mi Dashboard?"

4. Ellos te indicarán la ubicación exacta o la habilitarán por ti

## 📋 Opción 3: Verificar si ya está Habilitada

Es posible que la conversión automática **YA esté habilitada** pero no funcione por alguna razón:

1. Ve a **Stripe Dashboard** → **Payments**
2. Busca pagos recientes de clientes mexicanos
3. Si ves pagos en **MXN**, la conversión está funcionando
4. Si todos los pagos están en **USD**, la conversión NO está habilitada

## 🔧 Solución Alternativa: Detectar Ubicación y Usar Precio en MXN

Si no puedes habilitar la conversión automática, puedo implementar una solución donde:

1. Detectamos la ubicación del cliente (México u otro país)
2. Si es de México → usamos un precio en MXN
3. Si es de otro país → usamos el precio en USD

**Esto requiere:**
- Crear un precio en MXN en Stripe
- Agregar el precio en MXN a la base de datos
- Modificar el código para detectar la ubicación del cliente

¿Quieres que implemente esta solución alternativa?

## ✅ Verificar que Funciona

Después de habilitar la conversión automática:

1. **Desde México** (o con VPN configurado en México):
   - Intenta hacer un checkout
   - Deberías ver el precio en **MXN** (~$350 MXN)
   - Completa el pago
   - Verifica en Stripe Dashboard → Payments que el pago se procesó en **MXN**

2. **Desde otro país**:
   - Intenta hacer un checkout
   - Deberías ver el precio en la moneda local de ese país

## 🆘 Si Nada Funciona

Si después de seguir estos pasos el checkout sigue mostrando USD:

1. **Verifica el tipo de cuenta**: Algunas cuentas de Stripe tienen restricciones
2. **Verifica la región**: La conversión automática puede no estar disponible en todas las regiones
3. **Contacta a Stripe Support**: Ellos pueden habilitarla manualmente

## 📝 Notas Importantes

- La conversión automática es una **característica premium** de Stripe
- Puede tener **comisiones adicionales** por la conversión
- El tipo de cambio se actualiza automáticamente
- Tú recibes el equivalente en **USD** después de la conversión

