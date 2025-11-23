# 💳 Solución: Clientes Mexicanos No Pueden Pagar en USD

## 🔍 Problema

Los clientes mexicanos reportan que no pueden pagar porque el sistema "no soporta esa moneda" (USD), aunque el precio está configurado en dólares.

## ✅ Solución Implementada

He actualizado la función `stripe-checkout` para permitir pagos internacionales en USD. Los cambios incluyen:

1. **Recopilación automática de dirección de facturación** - Necesaria para algunos países
2. **Configuración de autenticación 3D Secure automática** - Mejora la seguridad y aceptación de pagos internacionales
3. **Soporte para conversión de moneda automática** - Stripe maneja la conversión si es necesario

## 🔧 Pasos Adicionales en Stripe Dashboard

### 1. Verificar Configuración de la Cuenta

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Asegúrate de estar en **modo Live** (no Test mode)
3. Ve a **Settings** → **Account** → **Business settings**
4. Verifica que tu cuenta esté **completamente activada**:
   - ✅ Información de negocio completa
   - ✅ Información de identidad verificada
   - ✅ Información bancaria configurada

### 2. Habilitar Pagos Internacionales

1. Ve a **Settings** → **Payment methods**
2. Verifica que **Cards** esté habilitado
3. En la sección **"Card payments"**, verifica:
   - ✅ **"Accept payments from"** → Debe estar configurado para aceptar pagos de **todos los países** o al menos incluir **México**
   - ✅ **"Supported currencies"** → Debe incluir **USD**

### 3. Verificar Configuración del Producto/Precio

1. Ve a **Products** → Selecciona tu producto
2. Verifica el precio:
   - ✅ **Currency**: Debe estar en **USD**
   - ✅ **No debe tener restricciones de país** configuradas
3. Si el precio tiene restricciones, elimínalas o crea un nuevo precio sin restricciones

### 4. Configurar Checkout Settings (Opcional pero Recomendado)

1. Ve a **Settings** → **Checkout** → **Checkout settings**
2. Verifica estas configuraciones:
   - ✅ **"Collect billing address"**: Configurado como **"Auto"** o **"Required"**
   - ✅ **"3D Secure"**: Configurado como **"Automatic"** o **"Required"**
   - ✅ **"Locale"**: Puedes configurarlo como **"Auto"** para detectar automáticamente el idioma del cliente

### 5. Verificar Límites de la Cuenta

1. Ve a **Settings** → **Account** → **Limits**
2. Verifica que no haya límites que bloqueen pagos desde México
3. Si hay límites, contacta a Stripe Support para levantarlos

## 🌍 Configuración Específica para México

### Métodos de Pago Adicionales (Opcional)

Si quieres mejorar la experiencia para clientes mexicanos, puedes habilitar métodos de pago locales:

1. Ve a **Settings** → **Payment methods**
2. Considera habilitar:
   - **OXXO** (muy popular en México)
   - **SPEI** (transferencias bancarias mexicanas)
   - **Link** (método de pago rápido de Stripe)

**Nota**: Estos métodos requieren configuración adicional y pueden tener diferentes tiempos de procesamiento.

## 🔄 Desplegar los Cambios

Después de verificar la configuración en Stripe, despliega la función actualizada:

```bash
# Desde la raíz del proyecto
supabase functions deploy stripe-checkout
```

O desde Supabase Dashboard:
1. Ve a **Edge Functions** → **stripe-checkout**
2. Haz clic en **"Deploy"** o **"Redeploy"**

## 🧪 Probar con Cliente Mexicano

### Usar Tarjeta de Prueba de Stripe

1. Usa una tarjeta de prueba de Stripe que simule una tarjeta mexicana
2. Tarjetas de prueba recomendadas:
   - `4242 4242 4242 4242` - Pago exitoso (simula tarjeta internacional)
   - `4000 0025 0000 3155` - Requiere autenticación 3D Secure

### Verificar en Stripe Dashboard

1. Ve a **Payments** en Stripe Dashboard
2. Verifica que los pagos de prueba se procesen correctamente
3. Revisa los logs si hay errores

## ⚠️ Problemas Comunes

### Error: "Currency not supported"

**Causa**: El precio en Stripe tiene restricciones de moneda o país.

**Solución**:
1. Ve a **Products** → Tu producto → Precio
2. Verifica que la moneda sea **USD**
3. Si hay restricciones de país, elimínalas
4. Crea un nuevo precio sin restricciones si es necesario

### Error: "Payment method not available"

**Causa**: La cuenta de Stripe no está configurada para aceptar pagos desde México.

**Solución**:
1. Verifica que tu cuenta esté completamente activada
2. Ve a **Settings** → **Payment methods** → **Cards**
3. Asegúrate de que acepta pagos de **todos los países** o al menos incluye **México**

### Error: "Account not activated"

**Causa**: La cuenta de Stripe necesita verificación adicional.

**Solución**:
1. Completa toda la información requerida en **Settings** → **Account**
2. Verifica tu identidad si es necesario
3. Configura información bancaria para recibir pagos

## 📞 Contactar Soporte de Stripe

Si después de seguir estos pasos los clientes mexicanos aún no pueden pagar:

1. Ve a [Stripe Support](https://support.stripe.com/)
2. Explica el problema: "Clientes mexicanos no pueden pagar en USD"
3. Proporciona:
   - ID de tu cuenta de Stripe
   - Ejemplo de Price ID que está fallando
   - Captura de pantalla del error (si es posible)

## ✅ Checklist Final

- [ ] Función `stripe-checkout` actualizada y desplegada
- [ ] Cuenta de Stripe completamente activada
- [ ] Pagos internacionales habilitados en Stripe Dashboard
- [ ] Producto/Precio configurado en USD sin restricciones
- [ ] Checkout settings configurados correctamente
- [ ] Probado con tarjeta de prueba
- [ ] Verificado que los pagos se procesan correctamente

## 🔗 Enlaces Útiles

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe: Accepting International Payments](https://stripe.com/docs/payments/payment-methods)
- [Stripe: Checkout Settings](https://dashboard.stripe.com/settings/checkout)
- [Stripe Support](https://support.stripe.com/)

