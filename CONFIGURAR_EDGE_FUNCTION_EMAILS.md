# 📧 Configuración de Edge Function para Emails

## ✅ Lo que ya está hecho

1. ✅ **Edge Function desplegada**: `send-welcome-email` está activa
2. ✅ **Migración aplicada**: El trigger y la tabla `pending_email_notifications` están creados

## 🔧 Configurar Variables de Entorno

Para que los emails funcionen, necesitas agregar las variables de entorno en Supabase:

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Edge Functions** → **send-welcome-email**
3. Haz clic en **Settings** o **Variables**
4. Agrega las siguientes variables:

   - **RESEND_API_KEY**: 
     - Si usas Resend: Tu API Key de Resend (empieza con `re_`)
     - Si NO usas Resend: Déjala vacía (usará SMTP de Supabase)
   
   - **ADMIN_EMAIL**: 
     - Tu email donde quieres recibir notificaciones de nuevos usuarios
     - Ejemplo: `tudominio@gmail.com`
   
   - **SITE_URL**: 
     - URL de tu aplicación
     - Ejemplo: `https://appspremiumv2.vercel.app`

### Opción 2: Usando Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase secrets set RESEND_API_KEY=re_tu_api_key_aqui --project-ref pezisfaeecgjdguneuip
supabase secrets set ADMIN_EMAIL=tu-email@ejemplo.com --project-ref pezisfaeecgjdguneuip
supabase secrets set SITE_URL=https://appspremiumv2.vercel.app --project-ref pezisfaeecgjdguneuip
```

## 📋 Cómo Funciona

### Flujo Automático:

1. **Usuario se registra** → Se crea en `auth.users`
2. **Trigger se activa** → Inserta registros en `pending_email_notifications`
3. **Edge Function procesa** → Envía emails de bienvenida y notificación

### Procesar Notificaciones Pendientes

Actualmente, el trigger crea registros en `pending_email_notifications`, pero necesitas llamar a la Edge Function para procesarlos.

**Opciones:**

#### Opción A: Llamar desde el código después de signUp (Recomendado)

Modifica `src/contexts/AuthContext.tsx` para llamar a la función después de crear el usuario:

```typescript
const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { error };
    }

    // Si el usuario se creó exitosamente, enviar email de bienvenida
    if (data.user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.user.email,
              userId: data.user.id,
              createdAt: data.user.created_at,
            }),
          });
        }
      } catch (emailError) {
        console.error('Error enviando email de bienvenida:', emailError);
        // No bloquear el registro si falla el email
      }
    }
    
    return { error };
  } catch (error: any) {
    return { error: error as Error };
  }
};
```

#### Opción B: Usar un Cron Job (Avanzado)

Puedes crear un cron job que procese las notificaciones pendientes periódicamente.

## 🧪 Probar que Funciona

1. **Crear una cuenta de prueba**
2. **Verificar que recibes**:
   - Email de bienvenida (si configuraste RESEND_API_KEY)
   - Notificación al admin (si configuraste ADMIN_EMAIL)

## ⚠️ Notas Importantes

- **Sin RESEND_API_KEY**: La función funcionará pero solo registrará en logs, no enviará emails
- **Con RESEND_API_KEY**: Los emails se enviarán automáticamente usando Resend
- **ADMIN_EMAIL**: Debe ser un email válido donde quieres recibir notificaciones
- **SITE_URL**: Debe ser la URL completa de tu aplicación (con https://)

## 🔍 Verificar Estado

Puedes ver las notificaciones pendientes en la tabla `pending_email_notifications`:
- Si `sent_at` es NULL, significa que aún no se ha procesado
- Si hay `error_message`, hubo un problema al enviar

