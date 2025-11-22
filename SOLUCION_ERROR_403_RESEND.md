# ✅ Solución: Error 403 - Dominio no Verificado en Resend

## ❌ Error Encontrado

```
403 Forbidden
"The gmail.com domain is not verified. Please, add and verify your domain on https://resend.com/domains"
```

## 🔍 Causa del Problema

Estás intentando enviar emails desde `todossomostr4ders@gmail.com`, pero Resend **no permite** enviar desde dominios que no has verificado.

**Resend solo permite enviar desde**:
1. Dominios que has verificado en Resend
2. El dominio de prueba: `onboarding@resend.dev`

## ✅ Solución

### Opción 1: Usar Dominio Verificado (Recomendado)

Tienes el dominio `mail.codextrader.tech` verificado en Resend. Usa ese:

1. **Ve a Supabase Dashboard**:
   - **Project Settings** → **Auth** → **SMTP Settings**

2. **Cambia el Sender Email**:
   ```
   Sender Email: noreply@mail.codextrader.tech
   ```
   (O cualquier email con el dominio `mail.codextrader.tech`)

3. **Guarda los cambios**

4. **Prueba de nuevo** el reset de contraseña

---

### Opción 2: Usar Dominio de Prueba de Resend (Temporal)

Si quieres una solución rápida temporal:

1. **Ve a Supabase Dashboard**:
   - **Project Settings** → **Auth** → **SMTP Settings**

2. **Cambia el Sender Email**:
   ```
   Sender Email: onboarding@resend.dev
   ```

3. **Guarda los cambios**

4. **Prueba de nuevo**

**Nota**: Los emails se enviarán desde `onboarding@resend.dev` en lugar de tu dominio personalizado.

---

## 📋 Configuración Correcta en Supabase

**SMTP Settings** debe quedar así:

```
✅ Enable Custom SMTP: ACTIVADO
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_xxxxxxxxxxxxx (tu API Key de Resend)
Sender Email: noreply@mail.codextrader.tech  ← CAMBIAR ESTO
Sender Name: Todos Somos Traders
```

---

## 🔍 Verificar Dominio en Resend

Para confirmar que `mail.codextrader.tech` está verificado:

1. **Ve a Resend Dashboard**:
   - https://resend.com/domains

2. **Busca `mail.codextrader.tech`**:
   - Debe aparecer con estado ✅ **Verified**

3. **Si no está verificado**:
   - Sigue las instrucciones de Resend para verificarlo
   - O usa temporalmente `onboarding@resend.dev`

---

## ✅ Después de Cambiar

1. **Espera 1-2 minutos** para que los cambios se propaguen
2. **Intenta enviar el reset de contraseña de nuevo**
3. **Verifica en Resend Dashboard** que el email se envió correctamente
4. **Revisa tu bandeja de entrada** (y spam) para el email de reset

---

## 💡 Nota Importante

**No puedes usar `@gmail.com`, `@yahoo.com`, `@hotmail.com`, etc.** en Resend porque:
- No puedes verificar esos dominios (son de Google, Yahoo, Microsoft)
- Resend requiere que verifiques tu propio dominio

**Solo puedes usar**:
- Tu dominio verificado: `@mail.codextrader.tech`
- Dominio de prueba: `@resend.dev`

