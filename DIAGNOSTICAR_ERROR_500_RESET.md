# 🔍 Diagnosticar Error 500 en Reset de Contraseña

## 📋 Pasos para Diagnosticar

### Paso 1: Revisar Logs de Supabase Auth

El error 500 viene del servidor de Supabase. Necesitas ver el error específico en los logs:

1. **Ve a Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ve a Logs**:
   - **Logs** → **Auth Logs**
   - O **Logs** → **Postgres Logs**

3. **Filtra por error**:
   - Busca errores relacionados con `resetPasswordForEmail`
   - Busca errores con código 500
   - Busca mensajes que contengan `gomail` (indica problema de SMTP)

4. **Copia el error completo** que aparece en los logs

---

### Paso 2: Verificar Template de Email

El template puede tener un problema de sintaxis que causa el error 500:

1. **Ve a Authentication → Email Templates → Reset Password**

2. **Verifica que el template**:
   - No tenga caracteres especiales problemáticos
   - Use las variables correctas: `{{ .ConfirmationURL }}`, `{{ .Year }}`
   - No tenga HTML mal formado

3. **Prueba con el template por defecto de Supabase**:
   - Temporalmente, reemplaza el template con el por defecto
   - Intenta enviar el reset
   - Si funciona, el problema está en tu template personalizado

**Template por defecto de Supabase** (para probar):
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

---

### Paso 3: Verificar Configuración de SMTP

Aunque parezca configurado, puede haber un problema:

1. **Ve a Project Settings → Auth → SMTP Settings**

2. **Verifica cada campo**:
   - **Host**: Debe ser exactamente `smtp.resend.com` (sin espacios)
   - **Port**: Debe ser `587` o `465` (números, no texto)
   - **Username**: Debe ser exactamente `resend` (minúsculas)
   - **Password**: Debe ser tu API Key completa de Resend (empieza con `re_`)
   - **Sender Email**: Debe ser un email válido del dominio verificado

3. **Prueba desactivando Custom SMTP temporalmente**:
   - Desactiva **Enable Custom SMTP**
   - Guarda
   - Intenta enviar el reset
   - Si funciona, el problema está en la configuración de SMTP/Resend

---

### Paso 4: Verificar en Resend Dashboard

1. **Ve a Resend Dashboard**:
   - https://resend.com/emails

2. **Revisa si hay intentos de envío**:
   - Busca emails fallidos
   - Revisa el motivo del fallo

3. **Verifica tu API Key**:
   - https://resend.com/api-keys
   - Asegúrate de que esté activa
   - Verifica que tenga permisos de envío

---

### Paso 5: Probar sin URL de Redirección Personalizada

El problema puede ser la URL de redirección. Prueba sin especificarla:

**En el código**, temporalmente cambia:

```typescript
// ANTES (con redirectTo)
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
  redirectTo: fullRedirectUrl,
});

// DESPUÉS (sin redirectTo - usa la Site URL por defecto)
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
```

Si funciona sin `redirectTo`, entonces el problema es que la URL no está en Redirect URLs permitidas.

---

## 🔧 Soluciones Comunes

### Error: "gomail: could not send email"

**Causa**: Problema de comunicación con SMTP

**Soluciones**:
1. Verifica que el Host sea correcto: `smtp.resend.com`
2. Verifica que el Port sea correcto: `587` o `465`
3. Verifica que la API Key de Resend sea válida
4. Verifica que el dominio esté verificado en Resend

---

### Error: "template parsing error"

**Causa**: El template de email tiene sintaxis incorrecta

**Soluciones**:
1. Verifica que todas las variables estén correctas: `{{ .ConfirmationURL }}`
2. Verifica que no haya caracteres especiales problemáticos
3. Prueba con el template por defecto de Supabase

---

### Error: "redirect_to url is not allowed"

**Causa**: La URL de redirección no está en la lista permitida

**Soluciones**:
1. Ve a Authentication → Settings → URL Configuration
2. Agrega la URL a Redirect URLs
3. O prueba sin especificar `redirectTo` en el código

---

## 📞 Información para Reportar

Si el problema persiste, necesitas esta información:

1. **Error específico de los logs de Supabase**:
   - Copia el mensaje de error completo
   - Incluye el stack trace si está disponible

2. **Configuración actual**:
   - Host, Port, Username de SMTP
   - Si Custom SMTP está activado
   - Sender Email configurado

3. **Template usado**:
   - Si es el personalizado o el por defecto
   - Si funciona con el template por defecto

4. **URL de redirección**:
   - Qué URL estás usando
   - Si está en Redirect URLs

---

## 💡 Prueba Rápida

Para probar rápidamente si el problema es el template o SMTP:

1. **Desactiva Custom SMTP** temporalmente
2. **Usa el template por defecto** de Supabase
3. **Intenta enviar el reset**

Si funciona:
- El problema está en tu configuración de SMTP o en tu template personalizado

Si no funciona:
- El problema es más profundo, revisa los logs de Supabase

