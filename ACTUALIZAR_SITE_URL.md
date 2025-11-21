# 🔧 Actualizar Variable SITE_URL en Supabase Edge Functions

## 📋 Instrucciones para Actualizar SITE_URL

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. **Ve al Dashboard de Supabase**:
   - Abre tu navegador y ve a: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Inicia sesión con tu cuenta

2. **Selecciona tu proyecto**:
   - Selecciona el proyecto: **Appspremium** (o el nombre de tu proyecto)
   - Project ID: `pezisfaeecgjdguneuip`

3. **Ve a Edge Functions Settings**:
   - En el menú lateral izquierdo, haz clic en **Edge Functions**
   - Luego haz clic en **Settings** (Configuración)

4. **Actualiza la variable SITE_URL**:
   - En la sección **Secrets** (Secretos), busca la variable `SITE_URL`
   - Si existe, haz clic en el botón de editar (lápiz) o elimínala y créala de nuevo
   - Si no existe, haz clic en **Add new secret** (Agregar nuevo secreto)
   - **Nombre**: `SITE_URL`
   - **Valor**: `https://todossomostraders.com`
   - Haz clic en **Save** (Guardar)

5. **Verifica que se guardó correctamente**:
   - Deberías ver `SITE_URL` en la lista de secretos con el valor `https://todossomostraders.com`

---

### Opción 2: Usando Supabase CLI (Si lo tienes instalado)

Si tienes el CLI de Supabase instalado y configurado, puedes ejecutar:

```bash
supabase secrets set SITE_URL=https://todossomostraders.com --project-ref pezisfaeecgjdguneuip
```

**Nota**: Para instalar Supabase CLI, visita: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

---

## ✅ Verificación

Después de actualizar la variable:

1. **Verifica en el Dashboard**:
   - Ve a Edge Functions → Settings → Secrets
   - Confirma que `SITE_URL` tiene el valor: `https://todossomostraders.com`

2. **Prueba las Edge Functions**:
   - Las Edge Functions que usan `SITE_URL` ahora usarán el nuevo dominio
   - Esto afecta a:
     - `stripe-webhook` (emails de compra)
     - `send-welcome-email` (emails de bienvenida)
     - `send-password-change-email` (emails de cambio de contraseña)

---

## 📝 Variables que Deben Estar Configuradas

Asegúrate de tener estas variables en Edge Functions Settings:

- ✅ `SITE_URL` = `https://todossomostraders.com`
- ✅ `SUPABASE_URL` = `https://pezisfaeecgjdguneuip.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)
- ✅ `STRIPE_SECRET_KEY` = (tu clave secreta de Stripe)
- ✅ `STRIPE_WEBHOOK_SECRET` = (solo para stripe-webhook)
- ✅ `RESEND_API_KEY` = (tu API key de Resend)
- ✅ `ADMIN_EMAIL` = `admin@todossomostraders.com` (o tu email)

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard**: [https://supabase.com/dashboard/project/pezisfaeecgjdguneuip](https://supabase.com/dashboard/project/pezisfaeecgjdguneuip)
- **Edge Functions Settings**: [https://supabase.com/dashboard/project/pezisfaeecgjdguneuip/settings/functions](https://supabase.com/dashboard/project/pezisfaeecgjdguneuip/settings/functions)

---

¡Listo! Una vez que actualices la variable `SITE_URL` en el Dashboard, todas las Edge Functions usarán el nuevo dominio `todossomostraders.com`.


