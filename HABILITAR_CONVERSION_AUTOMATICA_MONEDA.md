# 💱 Habilitar Conversión Automática de Moneda en Stripe

## 🎯 Objetivo
Mantener los precios en **USD** (para clientes de todo el mundo) pero permitir que cada cliente **pague en su moneda local** (MXN para mexicanos, EUR para europeos, etc.)

## ✅ Solución: Habilitar Conversión Automática

Stripe tiene una función llamada **"Currency conversion"** o **"Conversión de moneda"** que automáticamente:
- Muestra el precio en la moneda local del cliente
- Procesa el pago en la moneda local
- Convierte automáticamente usando el tipo de cambio actual

## 📋 Pasos para Habilitar

### Paso 1: Ir a Configuración de Checkout

1. Ve a **Stripe Dashboard**
2. En el menú lateral, busca **"Configuración"** o **"Settings"**
   - Puede estar en el ícono de perfil (esquina superior derecha)
   - O en el menú "Más" (tres puntos)
3. Haz clic en **"Checkout"** o **"Pago"**

### Paso 2: Habilitar Conversión Automática

En la página de **Checkout settings**, busca y **ACTIVA** estas opciones:

1. **"Currency conversion"** o **"Conversión de moneda"**
   - ✅ Actívala
   - Esto permite que Stripe convierta automáticamente USD a la moneda local

2. **"Localized pricing"** o **"Precios localizados"** (si está disponible)
   - ✅ Actívala
   - Esto muestra precios en la moneda del cliente

3. **"Show prices in customer's currency"** o **"Mostrar precios en la moneda del cliente"**
   - ✅ Actívala

### Paso 3: Verificar Métodos de Pago

1. En la misma página de Checkout, busca **"Payment method restrictions"** o **"Restricciones de métodos de pago"**
2. Verifica que **Cards** esté habilitado para **todos los países** (o al menos incluye México)
3. Verifica que las monedas soportadas incluyan **MXN** (pesos mexicanos)

### Paso 4: Guardar Cambios

1. Haz clic en **"Save changes"** o **"Guardar cambios"**
2. Los cambios se aplicarán inmediatamente

## 🔍 Cómo Funciona

Una vez habilitada la conversión automática:

1. **Cliente mexicano** visita tu sitio:
   - Ve el precio en **USD** ($20 USD)
   - Al hacer clic en "Pagar", Stripe detecta que está en México
   - Stripe muestra el precio convertido a **MXN** (~$350 MXN)
   - El cliente paga en **MXN**
   - Tú recibes el equivalente en **USD** (después de la conversión)

2. **Cliente estadounidense**:
   - Ve el precio en **USD** ($20 USD)
   - Paga en **USD** ($20 USD)

3. **Cliente europeo**:
   - Ve el precio en **USD** ($20 USD)
   - Al hacer checkout, Stripe muestra el precio en **EUR** (~€18 EUR)
   - El cliente paga en **EUR**

## ⚙️ Configuración Actual

Tu función `stripe-checkout` ya está configurada para:
- ✅ Aceptar pagos internacionales
- ✅ Recopilar dirección de facturación automáticamente
- ✅ Autenticación 3D Secure automática
- ✅ Usar el precio en USD como base

**Solo falta habilitar la conversión automática en Stripe Dashboard.**

## 🧪 Probar

Después de habilitar la conversión automática:

1. **Desde México** (o con VPN):
   - Intenta hacer un checkout
   - Deberías ver el precio en **MXN**
   - Completa el pago
   - Verifica en Stripe Dashboard → Payments que el pago se procesó en **MXN**

2. **Desde otro país**:
   - Intenta hacer un checkout
   - Deberías ver el precio en la moneda local de ese país

## 📊 Ver Pagos por Moneda

En Stripe Dashboard → **Payments**, puedes ver:
- Pagos en **USD** (clientes que pagaron en dólares)
- Pagos en **MXN** (clientes mexicanos)
- Pagos en otras monedas (clientes de otros países)

## ⚠️ Notas Importantes

1. **Tipo de cambio**: Stripe usa tipos de cambio actualizados automáticamente
2. **Comisiones**: Stripe cobra una pequeña comisión por la conversión de moneda
3. **Precio base**: Tu precio base sigue siendo **USD** ($20 USD)
4. **Recibes USD**: Aunque el cliente pague en MXN, tú recibes el equivalente en USD

## 🆘 Si No Encuentras la Opción

Si no encuentras "Currency conversion" en Checkout settings:

1. **Contacta a Stripe Support**: https://support.stripe.com/
2. Explica: "Necesito habilitar la conversión automática de moneda para que los clientes puedan pagar en su moneda local"
3. Ellos te indicarán la ubicación exacta en tu cuenta

## ✅ Checklist

- [ ] Conversión automática habilitada en Stripe Dashboard
- [ ] Métodos de pago verificados para todos los países
- [ ] MXN (y otras monedas) habilitadas
- [ ] Probado desde México (o con VPN)
- [ ] Verificado que los pagos se procesan en MXN

