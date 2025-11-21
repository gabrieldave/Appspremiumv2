# 🚀 Cómo Desplegar Edge Functions - Guía Paso a Paso

## ¿Qué son las Edge Functions?

Las Edge Functions son funciones que se ejecutan en el servidor de Supabase. Son como "mini programas" que se activan cuando algo sucede (por ejemplo, cuando alguien se registra o hace una compra).

## 📋 Edge Functions que Necesitas Desplegar

### 1. `send-password-change-email` (NUEVA)
Esta función envía un email cuando un usuario cambia su contraseña.

### 2. `stripe-webhook` (ACTUALIZAR)
Esta función ya existe, pero la actualizamos para enviar emails de compra. Necesitas actualizarla.

---

## 🎯 Opción 1: Usar Supabase Dashboard (MÁS FÁCIL) ⭐

### Paso 1: Ir al Dashboard de Supabase

1. Abre tu navegador y ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

### Paso 2: Desplegar `send-password-change-email` (NUEVA)

1. En el menú lateral, haz clic en **"Edge Functions"** (o busca en el menú)
2. Verás una lista de funciones. Busca si ya existe `send-password-change-email`
3. Si NO existe:
   - Haz clic en **"Create a new function"** o **"New Function"**
   - Nombre: `send-password-change-email`
   - Copia el contenido del archivo: `supabase/functions/send-password-change-email/index.ts`
   - Pega el código en el editor
   - Haz clic en **"Deploy"** o **"Save"**

4. Si YA existe:
   - Haz clic en `send-password-change-email`
   - Copia el contenido del archivo: `supabase/functions/send-password-change-email/index.ts`
   - Reemplaza todo el código existente
   - Haz clic en **"Deploy"** o **"Save"**

### Paso 3: Actualizar `stripe-webhook` (YA EXISTE)

1. En la lista de Edge Functions, busca `stripe-webhook`
2. Haz clic en `stripe-webhook`
3. Abre el archivo en tu computadora: `supabase/functions/stripe-webhook/index.ts`
4. Copia TODO el contenido del archivo
5. En el Dashboard, reemplaza TODO el código existente con el nuevo código
6. Haz clic en **"Deploy"** o **"Save"**

### Paso 4: Configurar Variables de Entorno

Para CADA función (`send-password-change-email` y `stripe-webhook`):

1. Haz clic en la función
2. Busca la sección **"Settings"** o **"Environment Variables"** o **"Secrets"**
3. Agrega estas variables (si no existen):

   **Para `send-password-change-email`:**
   - `RESEND_API_KEY` = Tu API Key de Resend (empieza con `re_`)
   - `SITE_URL` = `https://todossomostraders.com` (o tu URL)

   **Para `stripe-webhook`:**
   - `RESEND_API_KEY` = Tu API Key de Resend (empieza con `re_`)
   - `ADMIN_EMAIL` = Tu email (ejemplo: `tudominio@gmail.com`)
   - `SITE_URL` = `https://todossomostraders.com` (o tu URL)
   - `STRIPE_SECRET_KEY` = (ya debería estar configurado)
   - `STRIPE_WEBHOOK_SECRET` = (ya debería estar configurado)

4. Guarda los cambios

---

## 🎯 Opción 2: Usar Supabase CLI (Para Desarrolladores)

Si tienes Supabase CLI instalado en tu computadora:

### Paso 1: Abrir Terminal

Abre la terminal en la carpeta de tu proyecto:
```
C:\Users\dakyo\Documents\Proyectos de apps\appspremium
```

### Paso 2: Desplegar `send-password-change-email`

```bash
supabase functions deploy send-password-change-email
```

### Paso 3: Actualizar `stripe-webhook`

```bash
supabase functions deploy stripe-webhook
```

### Paso 4: Configurar Variables de Entorno

```bash
# Para send-password-change-email
supabase secrets set RESEND_API_KEY=tu_api_key_aqui
supabase secrets set SITE_URL=https://todossomostraders.com

# Para stripe-webhook (si no están configuradas)
supabase secrets set ADMIN_EMAIL=tu_email@gmail.com
```

---

## ✅ Verificar que Funciona

### Para `send-password-change-email`:
1. Ve a tu aplicación
2. Inicia sesión
3. Ve a "Mi Perfil"
4. Cambia tu contraseña
5. Deberías recibir un email de confirmación

### Para `stripe-webhook`:
1. Haz una compra de prueba en tu aplicación
2. Deberías recibir:
   - Un email de recibo (tú como usuario)
   - Un email de notificación (tú como admin)

---

## 🔍 ¿Dónde Están los Archivos?

Los archivos de las Edge Functions están en:
```
supabase/functions/
  ├── send-password-change-email/
  │   └── index.ts  ← Este archivo
  └── stripe-webhook/
      └── index.ts  ← Este archivo (actualizado)
```

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si no tengo RESEND_API_KEY?
- Los emails NO se enviarán automáticamente
- La función funcionará, pero solo hará logs en la consola
- Para que funcione, necesitas crear una cuenta en Resend.com y obtener tu API Key

### ¿Cómo obtengo RESEND_API_KEY?
1. Ve a https://resend.com
2. Crea una cuenta (gratis, 3,000 emails/mes)
3. Ve a "API Keys"
4. Crea una nueva API Key
5. Copia la clave (empieza con `re_`)
6. Pégala en las variables de entorno

### ¿Puedo usar otra cosa en lugar de Resend?
- Sí, pero necesitarías modificar el código de las Edge Functions
- Resend es la opción más fácil y recomendada

---

## 📝 Resumen Rápido

1. **Ir a Supabase Dashboard** → Edge Functions
2. **Crear/Actualizar** `send-password-change-email` con el código del archivo
3. **Actualizar** `stripe-webhook` con el código del archivo
4. **Configurar variables** de entorno (RESEND_API_KEY, ADMIN_EMAIL, SITE_URL)
5. **¡Listo!** Los emails se enviarán automáticamente


