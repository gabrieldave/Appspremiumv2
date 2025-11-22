# Variables de Entorno para Edge Functions

## Configuración de Email (Resend)

### RESEND_FROM_EMAIL
- **Nombre**: `RESEND_FROM_EMAIL`
- **Valor**: `noreply@mail.codextrader.tech`
- **Descripción**: Dirección de email desde la cual se envían todos los correos electrónicos del sistema
- **Dominio verificado**: `mail.codextrader.tech` (verificado en Resend)

### Configuración en Supabase
1. Ve a: Supabase Dashboard → Edge Functions → Settings → Secrets
2. Agrega o actualiza la variable:
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `noreply@mail.codextrader.tech`

### Notas Importantes
- ✅ El dominio `mail.codextrader.tech` está verificado en Resend
- ✅ Puedes usar cualquier dirección de email con este dominio (ej: `noreply@mail.codextrader.tech`, `support@mail.codextrader.tech`, etc.)
- ❌ NO usar `gmail.codextrader.tech` (no está verificado)
- ❌ NO usar `mail.codextrader.tech` sin el prefijo (ej: `@mail.codextrader.tech`)

### Funciones que usan esta variable
- `stripe-webhook` - Envío de recibos de compra y notificaciones
- `send-welcome-email` - Email de bienvenida
- `send-password-change-email` - Notificación de cambio de contraseña




