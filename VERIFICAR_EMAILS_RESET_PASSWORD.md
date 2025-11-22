# 📧 Verificación de Emails para Reset de Contraseña

## 📋 Resumen de Configuración

### ✅ Lo que está implementado:

1. **Funcionalidad de "Olvidar Contraseña"** en el frontend (`AuthModal.tsx`)
2. **Página de Reset de Contraseña** (`ResetPasswordPage.tsx`)
3. **Template HTML** para email de reset (`supabase/templates/reset-password-email.html`)
4. **Edge Functions** configuradas para usar Resend

### ⚠️ Lo que necesita verificación:

1. **Template de Reset Password configurado en Supabase Dashboard**
2. **Supabase Auth configurado para usar Resend como SMTP**
3. **Variables de entorno configuradas en Edge Functions**

---

## 🔍 Verificación Paso a Paso

### 1. Verificar Template de Reset Password en Supabase

**Ubicación**: Supabase Dashboard → Authentication → Email Templates → Reset Password

**Pasos**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Authentication** → **Email Templates**
4. Selecciona **Reset Password**
5. Verifica que el template contenga el HTML de `supabase/templates/reset-password-email.html`

**Si no está configurado**:
- Copia el contenido completo de `supabase/templates/reset-password-email.html`
- Pégalo en el editor de Supabase
- Guarda los cambios

**Variables disponibles en el template**:
- `{{ .ConfirmationURL }}` - URL con el token de recuperación
- `{{ .Email }}` - Email del usuario
- `{{ .SiteURL }}` - URL del sitio
- `{{ .Year }}` - Año actual

---

### 2. Verificar Configuración de SMTP/Resend en Supabase Auth

**Ubicación**: Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Pasos**:
1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Verifica que **Enable Custom SMTP** esté activado
3. Verifica la configuración:

#### Opción A: Usando Resend (Recomendado) ⭐

**Configuración**:
- **Host**: `smtp.resend.com`
- **Port**: `465` o `587`
- **Username**: `resend`
- **Password**: Tu API Key de Resend (empieza con `re_`)
- **Sender Email**: `noreply@mail.codextrader.tech` (o tu dominio verificado)
- **Sender Name**: `Todos Somos Traders`

**Nota**: Si usas Resend como SMTP, los emails de autenticación (reset password, confirm signup) se enviarán a través de Resend automáticamente.

#### Opción B: SMTP de Supabase (Por defecto)

Si no tienes SMTP personalizado configurado, Supabase usará su propio servicio de email (puede tener límites).

---

### 3. Verificar Variables de Entorno en Edge Functions

**Ubicación**: Supabase Dashboard → Edge Functions → Settings → Secrets

**Variables necesarias**:

#### Para todas las Edge Functions de email:

1. **RESEND_API_KEY**
   - **Valor**: Tu API Key de Resend (empieza con `re_`)
   - **Usado por**: `send-welcome-email`, `send-password-change-email`, `stripe-webhook`
   - **Obtener**: [Resend Dashboard](https://resend.com/api-keys) → API Keys

2. **RESEND_FROM_EMAIL**
   - **Valor**: `noreply@mail.codextrader.tech` (o tu dominio verificado)
   - **Usado por**: Todas las Edge Functions de email
   - **Nota**: Debe ser un dominio verificado en Resend

3. **SITE_URL** (Opcional, tiene default)
   - **Valor**: `https://todossomostraders.com`
   - **Usado por**: Todas las Edge Functions de email
   - **Default**: `https://todossomostraders.com`

4. **ADMIN_EMAIL** (Opcional, tiene default)
   - **Valor**: `todossomostr4ders@gmail.com` (o tu email)
   - **Usado por**: `send-welcome-email`, `stripe-webhook`
   - **Default**: `todossomostr4ders@gmail.com`

**Cómo verificar**:
1. Ve a **Edge Functions** → **Settings** → **Secrets**
2. Verifica que todas las variables estén configuradas
3. Si falta alguna, haz clic en **Add new secret** y agrega la variable

---

## 📧 Flujo de Emails de Reset de Contraseña

### Flujo Completo:

1. **Usuario hace clic en "¿Olvidaste tu contraseña?"**
   - Se muestra el formulario de recuperación en `AuthModal.tsx`

2. **Usuario ingresa su email y envía**
   - Se llama a `supabase.auth.resetPasswordForEmail()`
   - Supabase envía el email usando el template configurado

3. **Usuario recibe el email**
   - Email enviado desde: `noreply@mail.codextrader.tech` (o el configurado)
   - Template: El configurado en Supabase Dashboard
   - Contiene: Enlace con token de recuperación

4. **Usuario hace clic en el enlace**
   - Redirige a: `https://todossomostraders.com/reset-password#access_token=...`
   - La página `ResetPasswordPage.tsx` valida el token

5. **Usuario ingresa nueva contraseña**
   - Se actualiza la contraseña usando `supabase.auth.updateUser()`
   - Se redirige al login

---

## ✅ Checklist de Verificación

### Configuración en Supabase Dashboard:

- [ ] **Template de Reset Password configurado**
  - Ubicación: Authentication → Email Templates → Reset Password
  - Contenido: Debe ser el HTML de `reset-password-email.html`

- [ ] **SMTP/Resend configurado para Auth**
  - Ubicación: Project Settings → Auth → SMTP Settings
  - Enable Custom SMTP: ✅ Activado
  - Host: `smtp.resend.com` (si usas Resend)
  - Password: API Key de Resend

- [ ] **Variables de entorno en Edge Functions**
  - `RESEND_API_KEY`: Configurada ✅
  - `RESEND_FROM_EMAIL`: Configurada ✅
  - `SITE_URL`: Configurada (o usando default) ✅
  - `ADMIN_EMAIL`: Configurada (o usando default) ✅

### Configuración de URLs:

- [ ] **Site URL configurada**
  - Ubicación: Authentication → Settings → URL Configuration
  - Site URL: `https://todossomostraders.com`

- [ ] **Redirect URLs configuradas**
  - Ubicación: Authentication → Settings → URL Configuration
  - Redirect URLs incluyen:
    - `https://todossomostraders.com/**`
    - `https://todossomostraders.com/reset-password`

### Dominio en Resend:

- [ ] **Dominio verificado en Resend**
  - Ubicación: [Resend Dashboard](https://resend.com/domains)
  - Dominio: `mail.codextrader.tech` (o tu dominio)
  - Estado: ✅ Verificado

---

## 🧪 Prueba de Funcionamiento

### Probar el flujo completo:

1. **Abre tu aplicación en producción**
   - URL: `https://todossomostraders.com`

2. **Haz clic en "Iniciar Sesión"**
   - Se abre el modal de autenticación

3. **Haz clic en "¿Olvidaste tu contraseña?"**
   - Se muestra el formulario de recuperación

4. **Ingresa un email válido y envía**
   - Debe mostrar: "Se ha enviado un enlace de recuperación a tu correo electrónico"

5. **Revisa tu bandeja de entrada**
   - Debe llegar un email desde: `noreply@mail.codextrader.tech`
   - Asunto: "Restablecer Contraseña - Todos Somos Traders"
   - Debe contener el botón "Restablecer mi Contraseña"

6. **Haz clic en el enlace del email**
   - Debe redirigir a: `https://todossomostraders.com/reset-password#access_token=...`
   - Debe mostrar el formulario de nueva contraseña

7. **Ingresa una nueva contraseña y confirma**
   - Debe mostrar: "¡Contraseña Actualizada!"
   - Debe redirigir al login después de 2 segundos

---

## 🔧 Solución de Problemas

### Problema: No llega el email de reset

**Posibles causas**:
1. Template no configurado en Supabase
2. SMTP no configurado correctamente
3. Dominio no verificado en Resend
4. Email en spam

**Soluciones**:
1. Verifica que el template esté configurado en Supabase Dashboard
2. Verifica la configuración de SMTP/Resend
3. Verifica que el dominio esté verificado en Resend
4. Revisa la carpeta de spam
5. Revisa los logs de Supabase: Edge Functions → Logs

### Problema: El enlace del email no funciona

**Posibles causas**:
1. Redirect URLs no configuradas correctamente
2. Site URL incorrecta
3. Token expirado (válido por 1 hora)

**Soluciones**:
1. Verifica Redirect URLs en Supabase: Authentication → Settings
2. Verifica Site URL
3. Solicita un nuevo enlace de recuperación

### Problema: Error al actualizar contraseña

**Posibles causas**:
1. Token inválido o expirado
2. Contraseña no cumple requisitos (mínimo 6 caracteres)
3. Contraseñas no coinciden

**Soluciones**:
1. Solicita un nuevo enlace de recuperación
2. Asegúrate de que la contraseña tenga al menos 6 caracteres
3. Verifica que ambas contraseñas coincidan

---

## 📝 Notas Importantes

1. **Emails de Reset**: Se envían automáticamente por Supabase cuando se llama a `resetPasswordForEmail()`. No necesitas una Edge Function adicional para esto.

2. **Emails de Cambio de Contraseña**: Cuando el usuario cambia su contraseña desde su perfil (ya autenticado), se usa la Edge Function `send-password-change-email` que envía un email de confirmación.

3. **Template de Supabase**: El template de reset password usa variables de Supabase (`{{ .VariableName }}`) que se reemplazan automáticamente. No necesitas procesarlas manualmente.

4. **Dominio de Resend**: Actualmente se usa `mail.codextrader.tech` que está verificado. Si quieres usar otro dominio, debes verificarlo primero en Resend.

5. **Límites de Resend**: 
   - Plan gratuito: 3,000 emails/mes
   - Plan Pro: 50,000 emails/mes
   - Verifica tu uso en [Resend Dashboard](https://resend.com)

---

## 🎯 Estado Actual

- ✅ **Frontend**: Implementado y funcionando
- ✅ **Template HTML**: Creado y listo para usar
- ⚠️ **Configuración en Supabase**: Necesita verificación
- ⚠️ **Variables de entorno**: Necesita verificación
- ✅ **Dominio Resend**: `mail.codextrader.tech` verificado

---

## 📞 Soporte

Si tienes problemas después de verificar todo:
1. Revisa los logs de Supabase: Edge Functions → Logs
2. Revisa los logs de Resend: [Resend Dashboard](https://resend.com/emails)
3. Verifica la configuración de DNS si usas un dominio personalizado

