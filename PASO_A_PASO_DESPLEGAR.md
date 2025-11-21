# 📖 Paso a Paso: Cómo Desplegar las Edge Functions

## 🎯 Lo que Necesitas Hacer (MUY SIMPLE)

Solo necesitas **copiar y pegar código** en el Dashboard de Supabase. No necesitas instalar nada.

---

## 📍 Paso 1: Abrir Supabase Dashboard

1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión
3. Selecciona tu proyecto: **"Appspremium"**

---

## 📍 Paso 2: Desplegar `send-password-change-email` (NUEVA FUNCIÓN)

### 2.1. Ir a Edge Functions

1. En el menú lateral izquierdo, busca y haz clic en **"Edge Functions"**
   - Si no lo ves, busca en el menú o en "Functions"

### 2.2. Crear la Nueva Función

1. Haz clic en el botón **"New Function"** o **"Create Function"** (arriba a la derecha)
2. En "Function name", escribe: `send-password-change-email`
3. Haz clic en **"Create function"**

### 2.3. Copiar el Código

1. Abre el archivo en tu computadora:
   ```
   supabase/functions/send-password-change-email/index.ts
   ```
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** (Ctrl+C)

### 2.4. Pegar el Código

1. En el Dashboard de Supabase, en el editor de código
2. **Borra todo** lo que esté ahí
3. **Pega** el código que copiaste (Ctrl+V)
4. Haz clic en **"Deploy"** o **"Save"** (arriba a la derecha)

### 2.5. Configurar Variables

1. En la misma página, busca la pestaña **"Settings"** o **"Environment Variables"**
2. Haz clic en **"Add new secret"** o **"Add variable"**
3. Agrega estas dos variables:

   **Variable 1:**
   - Nombre: `RESEND_API_KEY`
   - Valor: Tu API Key de Resend (si no la tienes, déjala vacía por ahora)

   **Variable 2:**
   - Nombre: `SITE_URL`
   - Valor: `https://todossomostraders.com`

4. Guarda los cambios

---

## 📍 Paso 3: Actualizar `stripe-webhook` (FUNCIÓN EXISTENTE)

### 3.1. Encontrar la Función

1. En la lista de Edge Functions, busca **`stripe-webhook`**
2. Haz clic en **`stripe-webhook`**

### 3.2. Copiar el Código Actualizado

1. Abre el archivo en tu computadora:
   ```
   supabase/functions/stripe-webhook/index.ts
   ```
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** (Ctrl+C)

### 3.3. Reemplazar el Código

1. En el Dashboard de Supabase, en el editor de código
2. **Selecciona TODO** el código existente (Ctrl+A)
3. **Pega** el nuevo código (Ctrl+V) - esto reemplazará el código viejo
4. Haz clic en **"Deploy"** o **"Save"**

### 3.4. Verificar Variables

1. Ve a **"Settings"** o **"Environment Variables"**
2. Verifica que existan estas variables (si no, agrégalas):

   - `RESEND_API_KEY` = Tu API Key de Resend
   - `ADMIN_EMAIL` = Tu email (ejemplo: `tudominio@gmail.com`)
   - `SITE_URL` = `https://todossomostraders.com`
   - `STRIPE_SECRET_KEY` = (ya debería estar)
   - `STRIPE_WEBHOOK_SECRET` = (ya debería estar)

---

## ✅ ¡Listo!

Ahora las funciones están desplegadas y configuradas.

---

## 🧪 Cómo Probar que Funciona

### Probar `send-password-change-email`:
1. Ve a tu aplicación
2. Inicia sesión
3. Ve a "Mi Perfil"
4. Cambia tu contraseña
5. Revisa tu email - deberías recibir un email de confirmación

### Probar `stripe-webhook`:
1. Haz una compra de prueba
2. Revisa tu email - deberías recibir:
   - Un email de recibo (como usuario)
   - Un email de notificación (como admin)

---

## ❓ ¿No Tienes RESEND_API_KEY?

No te preocupes, puedes configurarla después:

1. Ve a **https://resend.com**
2. Crea una cuenta (gratis)
3. Ve a **"API Keys"**
4. Crea una nueva API Key
5. Copia la clave (empieza con `re_`)
6. Vuelve a Supabase Dashboard
7. Agrega la variable `RESEND_API_KEY` con ese valor

---

## 📸 ¿Dónde Están los Archivos?

Los archivos están en tu proyecto, en estas carpetas:

```
📁 supabase/
  📁 functions/
    📁 send-password-change-email/
      📄 index.ts  ← Copia este archivo
    📁 stripe-webhook/
      📄 index.ts  ← Copia este archivo
```

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Asegúrate de copiar TODO el código del archivo
2. Verifica que guardaste los cambios (botón "Deploy" o "Save")
3. Revisa que las variables de entorno estén configuradas
4. Si no funciona, revisa los "Logs" de la función en Supabase Dashboard


