# Configuración de Emails: SMTP vs Resend

## 📧 Opciones Disponibles

### Opción 1: SMTP Personalizado (Gratis/Barato)
**Ventajas:**
- ✅ Puedes usar tu propio servidor SMTP
- ✅ Control total sobre la configuración
- ✅ Gratis si usas servicios como Gmail SMTP (con límites)

**Desventajas:**
- ⚠️ Límites de envío (Gmail: 500 emails/día)
- ⚠️ Puede ir a spam más fácilmente
- ⚠️ Requiere configuración de SPF/DKIM/DMARC

**Cómo configurar:**
1. Ve a **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**
2. Activa **Enable Custom SMTP**
3. Configura:
   - **Host**: `smtp.gmail.com` (para Gmail) o tu servidor SMTP
   - **Port**: `587` (TLS) o `465` (SSL)
   - **Username**: Tu email
   - **Password**: Contraseña de aplicación (Gmail) o contraseña SMTP
   - **Sender Email**: `noreply@tudominio.com`
   - **Sender Name**: `Todos Somos Traders`

### Opción 2: Resend (Recomendado por Supabase) ⭐
**Ventajas:**
- ✅ Alta tasa de entrega (mejor que SMTP estándar)
- ✅ Fácil integración con Supabase
- ✅ 3,000 emails gratis/mes
- ✅ API moderna y fácil de usar
- ✅ Mejor para evitar spam

**Desventajas:**
- ⚠️ Requiere verificar dominio (recomendado)
- ⚠️ Después de 3,000 emails/mes hay costo

**Cómo configurar:**

#### Paso 1: Crear cuenta en Resend
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

#### Paso 2: Obtener API Key
1. En Resend Dashboard, ve a **API Keys**
2. Crea una nueva API Key
3. Copia la clave (empieza con `re_`)

#### Paso 3: Configurar en Supabase
1. Ve a **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**
2. Activa **Enable Custom SMTP**
3. Configura:
   - **Host**: `smtp.resend.com`
   - **Port**: `465` o `587`
   - **Username**: `resend`
   - **Password**: Tu API Key de Resend (empieza con `re_`)
   - **Sender Email**: `noreply@tudominio.com` (o usa el dominio de Resend)
   - **Sender Name**: `Todos Somos Traders`

#### Paso 4: Configurar Edge Function (Opcional)
Si quieres usar la Edge Function para emails personalizados:

1. Ve a **Supabase Dashboard** → **Edge Functions**
2. Crea una nueva función o actualiza `send-welcome-email`
3. Agrega las variables de entorno:
   - `RESEND_API_KEY`: Tu API Key de Resend
   - `ADMIN_EMAIL`: Tu email para recibir notificaciones
   - `SITE_URL`: URL de tu aplicación

## 🎯 Recomendación

**Para producción, usa Resend** porque:
- Mejor tasa de entrega
- Más confiable
- Fácil de configurar
- 3,000 emails gratis/mes es suficiente para empezar

**Para desarrollo/pruebas**, puedes usar SMTP de Gmail si quieres algo gratis rápido.

## 📝 Templates Creados

Se han creado los siguientes templates:

1. **confirm-signup-email.html** - Email de confirmación de registro
2. **welcome-email.html** - Email de bienvenida al usuario
3. **admin-new-user-notification.html** - Notificación al admin cuando alguien se registra

## 🔧 Configurar Templates en Supabase

1. Ve a **Authentication** → **Email Templates**
2. Para cada template:
   - **Confirm signup**: Usa `confirm-signup-email.html`
   - Puedes crear templates personalizados para otros eventos

## 🚀 Edge Function para Emails Automáticos

Se ha creado `supabase/functions/send-welcome-email/index.ts` que:
- Envía email de bienvenida al usuario cuando se registra
- Envía notificación al admin

**Para activarlo:**
1. Despliega la función en Supabase
2. Configura un trigger en la base de datos que llame a esta función cuando se crea un usuario
3. O llámala manualmente desde tu código después de `signUp`

## 📋 Checklist de Configuración

- [ ] Decidir entre SMTP o Resend
- [ ] Configurar SMTP/Resend en Supabase Dashboard
- [ ] Configurar templates de email en Supabase
- [ ] Probar envío de email de confirmación
- [ ] Configurar Edge Function (opcional)
- [ ] Probar email de bienvenida
- [ ] Verificar que las notificaciones al admin funcionen

## 🔍 Verificar que Funciona

1. Crea una cuenta de prueba
2. Verifica que recibes el email de confirmación
3. Confirma el email
4. Verifica que recibes el email de bienvenida (si está configurado)
5. Verifica que el admin recibe la notificación

