# 🔧 Solución: Error al Enviar Email de Reset de Contraseña

## ❌ Problema

Al intentar usar "Olvidar contraseña", aparece el error:
```
No se pudo enviar el email. Verifica que el correo sea correcto.
```

## 🔍 Causas Comunes

### 1. URL de Redirección no Configurada (MÁS COMÚN)

**Problema**: La URL `https://todossomostraders.com/reset-password` no está en la lista de Redirect URLs permitidas en Supabase.

**Solución**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Authentication** → **Settings** → **URL Configuration**
4. En **Redirect URLs**, asegúrate de tener:
   ```
   https://todossomostraders.com/**
   https://todossomostraders.com/reset-password
   http://localhost:3000/**
   http://localhost:3000/reset-password
   ```
5. Haz clic en **Save**
6. Espera 1-2 minutos para que se propaguen los cambios

**Nota**: El `/**` permite cualquier ruta bajo ese dominio.

---

### 2. Site URL Incorrecta

**Problema**: La Site URL en Supabase no coincide con tu dominio de producción.

**Solución**:
1. Ve a **Authentication** → **Settings** → **URL Configuration**
2. En **Site URL**, asegúrate de que sea:
   ```
   https://todossomostraders.com
   ```
3. Haz clic en **Save**

---

### 3. Email no Existe en la Base de Datos

**Problema**: El email ingresado no está registrado en Supabase.

**Nota**: Por seguridad, Supabase no revela si un email existe o no. Siempre devuelve éxito, pero si el email no existe, simplemente no se envía el correo.

**Solución**:
- Verifica que el email esté correctamente escrito
- Asegúrate de que el usuario esté registrado en Supabase
- Revisa en **Authentication** → **Users** si el email existe

---

### 4. Configuración de SMTP/Resend Incorrecta

**Problema**: Supabase no puede enviar emails porque SMTP/Resend no está configurado correctamente.

**Solución**:
1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Verifica que **Enable Custom SMTP** esté activado
3. Si usas Resend:
   - **Host**: `smtp.resend.com`
   - **Port**: `465` o `587`
   - **Username**: `resend`
   - **Password**: Tu API Key de Resend (empieza con `re_`)
   - **Sender Email**: `noreply@mail.codextrader.tech`
4. Haz clic en **Save**

---

### 5. Template de Email no Configurado

**Problema**: El template de reset password no está configurado en Supabase.

**Solución**:
1. Ve a **Authentication** → **Email Templates**
2. Selecciona **Reset Password**
3. Copia el contenido de `supabase/templates/reset-password-email.html`
4. Pégalo en el editor
5. Haz clic en **Save**

---

## 🧪 Cómo Verificar el Error Específico

1. **Abre la consola del navegador** (F12)
2. **Intenta enviar el reset de contraseña**
3. **Busca en la consola** el mensaje que empieza con `❌ Error al enviar reset de contraseña:`
4. **Revisa el objeto de error** que se muestra, especialmente:
   - `message`: Mensaje de error específico
   - `status`: Código de estado HTTP
   - `redirectUrl`: URL que se está intentando usar

---

## ✅ Checklist de Verificación

Antes de reportar el problema, verifica:

- [ ] **Redirect URLs configuradas** en Supabase
  - Incluye: `https://todossomostraders.com/**`
  - Incluye: `https://todossomostraders.com/reset-password`

- [ ] **Site URL configurada** correctamente
  - Debe ser: `https://todossomostraders.com`

- [ ] **SMTP/Resend configurado** en Supabase Auth
  - Enable Custom SMTP: ✅ Activado
  - Host, Port, Username, Password configurados

- [ ] **Template de Reset Password** configurado
  - Ubicación: Authentication → Email Templates → Reset Password
  - Contiene el HTML correcto

- [ ] **Email existe** en Supabase
  - Verifica en: Authentication → Users

- [ ] **Dominio verificado** en Resend (si usas Resend)
  - Verifica en: [Resend Dashboard](https://resend.com/domains)

---

## 🔍 Verificar en la Consola del Navegador

Cuando intentas enviar el reset, deberías ver en la consola:

```
📧 Enviando solicitud de reset de contraseña: {
  email: "tradingsinperdidas@gmail.com",
  redirectUrl: "https://todossomostraders.com/reset-password",
  origin: "https://todossomostraders.com",
  siteUrl: "https://todossomostraders.com"
}
```

Si hay un error, verás:

```
❌ Error al enviar reset de contraseña: {
  error: {...},
  message: "Error específico aquí",
  status: 400,
  email: "tradingsinperdidas@gmail.com",
  redirectUrl: "https://todossomostraders.com/reset-password"
}
```

**Copia este error completo** y úsalo para diagnosticar el problema.

---

## 🚨 Errores Comunes y Soluciones

### Error: "redirect_to url is not allowed"

**Causa**: La URL de redirección no está en la lista de Redirect URLs.

**Solución**: Agrega la URL a Redirect URLs en Supabase (ver sección 1 arriba).

---

### Error: "Email rate limit exceeded"

**Causa**: Demasiados intentos de reset en poco tiempo.

**Solución**: Espera 10-15 minutos antes de intentar de nuevo.

---

### Error: "Invalid email address"

**Causa**: El formato del email es incorrecto.

**Solución**: Verifica que el email tenga un formato válido (ej: `usuario@dominio.com`).

---

### Error: "SMTP configuration error"

**Causa**: La configuración de SMTP/Resend es incorrecta.

**Solución**: Verifica la configuración de SMTP en Supabase (ver sección 4 arriba).

---

## 📞 Si el Problema Persiste

1. **Revisa los logs de Supabase**:
   - Ve a **Logs** → **Auth Logs**
   - Busca errores relacionados con `resetPasswordForEmail`

2. **Revisa los logs de Resend** (si usas Resend):
   - Ve a [Resend Dashboard](https://resend.com/emails)
   - Busca intentos de envío fallidos

3. **Verifica la configuración completa**:
   - Usa el checklist de arriba
   - Asegúrate de que todo esté configurado correctamente

4. **Prueba con un email diferente**:
   - Asegúrate de que el email esté registrado en Supabase
   - Prueba con un email que sepas que existe

---

## 💡 Nota Importante

Supabase, por seguridad, **siempre devuelve éxito** cuando llamas a `resetPasswordForEmail()`, incluso si el email no existe. Esto es para evitar que atacantes descubran qué emails están registrados.

**Esto significa que**:
- Si el email existe → Se envía el correo
- Si el email NO existe → No se envía el correo, pero Supabase devuelve éxito de todas formas

Por eso, el mensaje de éxito ahora dice: "Si el correo está registrado, recibirás un enlace de recuperación."

