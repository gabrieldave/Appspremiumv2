# 🔧 Solución: Error 500 al Enviar Reset de Contraseña

## ❌ Error

```
AuthApiError: Error sending recovery email
500 (Internal Server Error)
```

Este error indica que **Supabase no puede enviar el email** porque hay un problema en la configuración del servidor.

## ✅ Solución Paso a Paso

### Paso 1: Verificar Configuración de SMTP/Resend en Supabase

1. **Ve a Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Selecciona tu proyecto: `pezisfaeecgjdguneuip`

2. **Navega a SMTP Settings**:
   - **Project Settings** → **Auth** → **SMTP Settings**

3. **Verifica la configuración**:

#### Si usas Resend (Recomendado):

```
✅ Enable Custom SMTP: ACTIVADO
Host: smtp.resend.com
Port: 587 (o 465)
Username: resend
Password: re_xxxxxxxxxxxxx (tu API Key de Resend)
Sender Email: noreply@mail.codextrader.tech
Sender Name: Todos Somos Traders
```

**IMPORTANTE**:
- El **Password** debe ser tu **API Key de Resend completa** (empieza con `re_`)
- El **Sender Email** debe ser un dominio **verificado en Resend**
- Si no tienes dominio verificado, usa: `onboarding@resend.dev` (temporal)

#### Si NO tienes Resend configurado:

**Opción A: Desactivar SMTP personalizado (usar SMTP de Supabase)**
- Desactiva **Enable Custom SMTP**
- Supabase usará su propio servicio de email (puede tener límites)

**Opción B: Configurar Resend ahora**
- Ve a [resend.com](https://resend.com) y crea una cuenta
- Obtén tu API Key
- Configura como se indica arriba

---

### Paso 2: Verificar Template de Reset Password

1. **Ve a Email Templates**:
   - **Authentication** → **Email Templates**
   - Selecciona **Reset Password**

2. **Verifica que el template esté configurado**:
   - Debe tener contenido HTML
   - Debe incluir la variable `{{ .ConfirmationURL }}`

3. **Si está vacío o incorrecto**:
   - Copia el contenido de `supabase/templates/reset-password-email.html`
   - Pégalo en el editor
   - Haz clic en **Save**

---

### Paso 3: Verificar Redirect URLs

1. **Ve a URL Configuration**:
   - **Authentication** → **Settings** → **URL Configuration**

2. **Verifica Site URL**:
   ```
   https://todossomostraders.com
   ```

3. **Verifica Redirect URLs** (debe incluir):
   ```
   https://todossomostraders.com/**
   https://todossomostraders.com/reset-password
   http://localhost:3000/**
   http://localhost:3000/reset-password
   ```

4. **Guarda los cambios**

---

### Paso 4: Verificar Dominio en Resend

Si usas Resend con un dominio personalizado:

1. **Ve a Resend Dashboard**:
   - https://resend.com/domains

2. **Verifica que tu dominio esté verificado**:
   - `mail.codextrader.tech` debe estar ✅ Verificado

3. **Si no está verificado**:
   - Opción A: Verifica el dominio siguiendo las instrucciones de Resend
   - Opción B: Usa temporalmente `onboarding@resend.dev` como Sender Email

---

### Paso 5: Probar de Nuevo

1. **Espera 1-2 minutos** después de hacer cambios en Supabase
2. **Intenta enviar el reset de contraseña de nuevo**
3. **Revisa la consola** para ver si el error cambió

---

## 🔍 Diagnóstico Adicional

### Verificar Logs de Supabase

1. **Ve a Logs**:
   - **Logs** → **Auth Logs**

2. **Busca errores relacionados con**:
   - `resetPasswordForEmail`
   - `smtp`
   - `email`

3. **Revisa el mensaje de error específico** en los logs

### Verificar API Key de Resend

1. **Ve a Resend Dashboard**:
   - https://resend.com/api-keys

2. **Verifica que tu API Key**:
   - Esté activa
   - No haya expirado
   - Tenga permisos de envío

3. **Si es necesario, crea una nueva API Key**:
   - Copia la nueva key
   - Actualiza en Supabase: **SMTP Settings** → **Password**

---

## 🚨 Soluciones Rápidas

### Solución Rápida 1: Usar SMTP de Supabase (Temporal)

Si necesitas que funcione **ahora mismo**:

1. **Desactiva Custom SMTP**:
   - **Project Settings** → **Auth** → **SMTP Settings**
   - Desactiva **Enable Custom SMTP**
   - Guarda

2. **Prueba de nuevo**
   - Supabase usará su propio servicio de email
   - Puede tener límites, pero funcionará

### Solución Rápida 2: Usar Resend con Dominio de Prueba

Si tienes Resend pero no dominio verificado:

1. **Configura SMTP en Supabase**:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: re_tu_api_key_aqui
   Sender Email: onboarding@resend.dev
   Sender Name: Todos Somos Traders
   ```

2. **Guarda y prueba**

---

## ✅ Checklist de Verificación

Antes de reportar que no funciona, verifica:

- [ ] **SMTP/Resend configurado** en Supabase
  - Enable Custom SMTP: ✅ Activado
  - Host, Port, Username, Password correctos
  - Sender Email válido

- [ ] **Template de Reset Password** configurado
  - Authentication → Email Templates → Reset Password
  - Tiene contenido HTML válido

- [ ] **Redirect URLs** configuradas
  - Incluye: `https://todossomostraders.com/**`
  - Incluye: `https://todossomostraders.com/reset-password`

- [ ] **Site URL** configurada
  - Debe ser: `https://todossomostraders.com`

- [ ] **Dominio verificado en Resend** (si usas dominio personalizado)
  - O usa `onboarding@resend.dev` temporalmente

- [ ] **API Key de Resend válida**
  - No expirada
  - Con permisos de envío

---

## 📞 Si Aún No Funciona

1. **Revisa los logs de Supabase**:
   - Logs → Auth Logs
   - Busca el error específico

2. **Prueba con un email diferente**:
   - Asegúrate de que el email esté registrado en Supabase

3. **Verifica en Resend Dashboard**:
   - https://resend.com/emails
   - Ve si hay intentos de envío fallidos
   - Revisa el motivo del fallo

4. **Contacta a Supabase Support**:
   - Si el problema persiste después de verificar todo
   - Proporciona los logs de error

---

## 💡 Nota Importante

El error 500 significa que **Supabase no puede procesar la solicitud** en el servidor. Esto **NO es un problema del código del frontend**, sino de la configuración del servidor de Supabase.

Las causas más comunes son:
1. ❌ SMTP/Resend mal configurado (90% de los casos)
2. ❌ Template de email vacío o inválido
3. ❌ API Key de Resend inválida o expirada
4. ❌ Dominio no verificado en Resend

