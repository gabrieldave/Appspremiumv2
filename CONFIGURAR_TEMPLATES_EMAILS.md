# 📧 Configuración de Templates de Emails

## Templates Creados

Se han creado los siguientes templates HTML para todas las ocasiones de email:

### Para Usuarios:
1. ✅ **confirm-signup-email.html** - Confirmación de registro (ya existía)
2. ✅ **welcome-email.html** - Email de bienvenida (ya existía)
3. ✅ **purchase-receipt-email.html** - Recibo de compra/suscripción con fechas de vencimiento
4. ✅ **reset-password-email.html** - Restablecimiento de contraseña
5. ✅ **change-password-email.html** - Confirmación de cambio de contraseña

### Para Administrador:
1. ✅ **admin-new-user-notification.html** - Notificación de nuevo usuario (ya existía)
2. ✅ **admin-purchase-notification.html** - Notificación de nueva compra/suscripción

## 📋 Configuración en Supabase Dashboard

### Paso 1: Configurar Templates de Autenticación

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Authentication** → **Email Templates**

#### Template: Confirm signup
- Selecciona **Confirm signup**
- Copia el contenido de `supabase/templates/confirm-signup-email.html`
- Pega en el editor
- **Variables disponibles**: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`, `{{ .Year }}`

#### Template: Reset Password
- Selecciona **Reset Password**
- Copia el contenido de `supabase/templates/reset-password-email.html`
- Pega en el editor
- **Variables disponibles**: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`, `{{ .Year }}`

#### Template: Change Email (Opcional)
- Si quieres personalizar el cambio de email, puedes crear un template similar

### Paso 2: Configurar Edge Functions para Emails Personalizados

Los emails de compra y cambio de contraseña se envían mediante Edge Functions que usan Resend.

#### Variables de Entorno Necesarias:
- `RESEND_API_KEY` - Tu API Key de Resend
- `ADMIN_EMAIL` - Email del administrador
- `SITE_URL` - URL de tu aplicación

## 🔧 Integración con Código

### Emails Automáticos de Supabase:
- ✅ **Confirmación de registro**: Se envía automáticamente al registrarse
- ✅ **Restablecimiento de contraseña**: Se envía automáticamente al usar "Olvidé mi contraseña"
- ✅ **Cambio de contraseña**: Se puede configurar para enviarse automáticamente

### Emails mediante Edge Functions:
- ✅ **Bienvenida**: Se envía mediante `send-welcome-email` Edge Function
- ✅ **Notificación de nuevo usuario**: Se envía mediante `send-welcome-email` Edge Function
- ⚠️ **Recibo de compra**: Se debe integrar en el webhook de Stripe
- ⚠️ **Notificación de compra al admin**: Se debe integrar en el webhook de Stripe
- ⚠️ **Confirmación de cambio de contraseña**: Se debe integrar en el flujo de cambio de contraseña

## 📝 Variables de Templates

### Template: purchase-receipt-email.html
```html
{{ .ProductName }}        - Nombre del producto
{{ .PurchaseType }}      - "Suscripción" o "Compra única"
{{ .Amount }}            - Monto pagado
{{ .Currency }}          - Moneda (USD, MXN, etc.)
{{ .PurchaseDate }}      - Fecha de compra
{{ .TransactionId }}     - ID de transacción
{{ .IsSubscription }}    - true/false
{{ .SubscriptionStartDate }} - Fecha de inicio de suscripción
{{ .SubscriptionEndDate }}   - Fecha de vencimiento
{{ .NextPaymentDate }}   - Próxima fecha de pago
{{ .SiteURL }}           - URL del sitio
{{ .Year }}              - Año actual
```

### Template: admin-purchase-notification.html
```html
{{ .PurchaseType }}      - Tipo de compra
{{ .CustomerEmail }}     - Email del cliente
{{ .UserId }}            - ID del usuario
{{ .StripeCustomerId }}  - ID de cliente en Stripe
{{ .ProductName }}       - Nombre del producto
{{ .Amount }}            - Monto
{{ .Currency }}          - Moneda
{{ .PurchaseDate }}      - Fecha
{{ .TransactionId }}     - ID de transacción
{{ .PaymentStatus }}     - Estado del pago
{{ .IsSubscription }}    - true/false
{{ .SubscriptionId }}    - ID de suscripción
{{ .SubscriptionStatus }} - Estado de suscripción
{{ .SubscriptionStartDate }} - Fecha de inicio
{{ .SubscriptionEndDate }}   - Fecha de vencimiento
{{ .SiteURL }}           - URL del sitio
{{ .Year }}              - Año actual
```

### Template: change-password-email.html
```html
{{ .ChangeDate }}        - Fecha del cambio
{{ .ChangeTime }}        - Hora del cambio
{{ .SiteURL }}           - URL del sitio
{{ .Year }}              - Año actual
```

## 🚀 Próximos Pasos

1. ✅ **Configurar templates en Supabase Dashboard** (Confirm signup y Reset Password)
2. ✅ **Integrar emails de compra** en el webhook de Stripe (YA IMPLEMENTADO)
3. ✅ **Integrar email de cambio de contraseña** en el flujo de cambio de contraseña (YA IMPLEMENTADO)
4. **Desplegar Edge Functions**:
   - `send-welcome-email` (ya desplegada)
   - `send-password-change-email` (nueva, necesita despliegue)
   - `stripe-webhook` (ya desplegada, actualizada con emails)
5. **Configurar variables de entorno** en todas las Edge Functions:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
   - `SITE_URL`
6. **Probar todos los emails** para asegurar que funcionan correctamente

## 📦 Edge Functions a Desplegar

### 1. send-password-change-email
**Ubicación**: `supabase/functions/send-password-change-email/index.ts`

**Variables de entorno necesarias**:
- `RESEND_API_KEY` (opcional, pero recomendado)
- `SITE_URL` (opcional, default: https://todossomostraders.com)

**Cómo desplegar**:
```bash
supabase functions deploy send-password-change-email
```

### 2. stripe-webhook (actualizada)
**Ubicación**: `supabase/functions/stripe-webhook/index.ts`

**Variables de entorno necesarias**:
- `RESEND_API_KEY` (opcional, pero recomendado)
- `ADMIN_EMAIL` (opcional, default: admin@todossomostraders.com)
- `SITE_URL` (opcional, default: https://todossomostraders.com)
- `STRIPE_SECRET_KEY` (requerido)
- `STRIPE_WEBHOOK_SECRET` (requerido)

**Cómo desplegar**:
```bash
supabase functions deploy stripe-webhook
```

## ✅ Estado de Implementación

- ✅ Templates HTML creados para todas las ocasiones
- ✅ Email de confirmación de registro (Supabase template)
- ✅ Email de bienvenida (Edge Function)
- ✅ Notificación de nuevo usuario al admin (Edge Function)
- ✅ Email de recibo de compra (Edge Function en webhook)
- ✅ Notificación de compra al admin (Edge Function en webhook)
- ✅ Email de restablecimiento de contraseña (Supabase template)
- ✅ Email de cambio de contraseña (Edge Function)

## 📌 Notas Importantes

- Los templates usan variables de Supabase (`{{ .VariableName }}`) que se reemplazan automáticamente
- Para emails personalizados (compra, cambio de contraseña), necesitas usar Edge Functions con Resend
- Asegúrate de tener configurado Resend API Key en las variables de entorno
- Los templates están diseñados para ser responsive y compatibles con la mayoría de clientes de email

