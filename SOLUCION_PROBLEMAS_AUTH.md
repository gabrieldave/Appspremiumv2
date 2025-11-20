# 🔧 Solución de Problemas de Autenticación

## ❌ Error: "Invalid login credentials"

Este error aparece cuando las credenciales no coinciden o hay un problema de configuración.

### Posibles Causas y Soluciones:

#### 1. **Variables de Entorno no Configuradas en Vercel** ⚠️

**Problema**: Si desplegaste en Vercel y no configuraste las variables de entorno, la aplicación no puede conectarse a Supabase.

**Solución**:
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings** → **Environment Variables**
3. Agrega estas variables:
   - `VITE_SUPABASE_URL` = `https://pezisfaeecgjdguneuip.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (tu clave anónima de Supabase)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = (tu clave pública de Stripe)

4. **IMPORTANTE**: Después de agregar las variables, haz un **nuevo deploy**:
   - Ve a **Deployments**
   - Click en los 3 puntos (...) del último deploy
   - Click en **Redeploy**

#### 2. **Usuario No Existe**

**Problema**: El email que intentas usar no está registrado en Supabase.

**Solución**:
1. **Regístrate primero**: Ve a la página de registro y crea una cuenta con ese email
2. **Verifica tu email**: Revisa tu correo y confirma tu cuenta
3. **Vuelve a iniciar sesión**: Después de confirmar, podrás iniciar sesión

#### 3. **Contraseña Incorrecta**

**Problema**: La contraseña que ingresaste no coincide con la registrada.

**Solución**:
1. Verifica que no tengas activado **Caps Lock**
2. Asegúrate de escribir la contraseña correctamente
3. Si olvidaste la contraseña:
   - Ve a la página de login
   - Click en "¿Olvidaste tu contraseña?"
   - Ingresa tu email y sigue las instrucciones

#### 4. **Email No Confirmado**

**Problema**: Algunos proyectos de Supabase requieren confirmar el email antes de iniciar sesión.

**Solución**:
1. Revisa tu bandeja de entrada (y spam) del email que usaste para registrarte
2. Busca un email de Supabase con el asunto "Confirma tu email"
3. Click en el enlace de confirmación
4. Vuelve a intentar iniciar sesión

#### 5. **Configuración de Auth en Supabase**

**Problema**: Puede haber restricciones en la configuración de autenticación.

**Solución**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium**
3. Ve a **Authentication** → **Settings**
4. Revisa estas configuraciones:
   - **Enable Email Confirmations**: Si está activado, debes confirmar tu email
   - **Site URL**: Debe ser la URL de tu aplicación (ej: `https://tu-app.vercel.app`)
   - **Redirect URLs**: Debe incluir las URLs permitidas

---

## 🔍 Diagnóstico

### Verificar Variables de Entorno en la Consola

Abre la consola del navegador (F12) y busca estos mensajes:

**✅ Si ves esto, todo está bien:**
```
🔍 Diagnóstico de Supabase:
URL: ✅ Configurada
Anon Key: ✅ Configurada
```

**❌ Si ves esto, falta configuración:**
```
❌ Faltan variables de entorno de Supabase: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

**⚠️ Si ves esto, la URL puede estar incorrecta:**
```
⚠️ La URL de Supabase parece incorrecta: ...
```

### Verificar la Conexión con Supabase

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network** (Red)
3. Intenta iniciar sesión
4. Busca una solicitud a `auth/v1/token` o similar
5. Revisa:
   - **Status**: Debe ser `200` (éxito) o `400` (error de credenciales)
   - **Response**: Verás el mensaje de error específico

---

## 🆘 Pasos de Solución Rápida

### Si acabas de desplegar en Vercel:

1. ✅ Verifica que las variables de entorno estén configuradas
2. ✅ Haz un **Redeploy** después de agregar las variables
3. ✅ Espera 2-3 minutos para que el deploy termine
4. ✅ Intenta iniciar sesión de nuevo

### Si el usuario existe pero no puede iniciar sesión:

1. ✅ Verifica que el email esté confirmado (revisa tu correo)
2. ✅ Asegúrate de escribir la contraseña correctamente
3. ✅ Intenta restablecer la contraseña
4. ✅ Si nada funciona, crea un nuevo usuario

### Si es un usuario nuevo:

1. ✅ Regístrate primero con el email deseado
2. ✅ Confirma tu email si es necesario
3. ✅ Luego inicia sesión con esas credenciales

---

## 📞 Contacto de Soporte

Si después de seguir estos pasos aún tienes problemas:

1. Abre la consola del navegador (F12)
2. Copia los mensajes de error que aparecen
3. Toma una captura de pantalla del error
4. Comparte estos detalles para recibir ayuda

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] Redeploy realizado después de configurar variables
- [ ] Usuario creado en la aplicación
- [ ] Email confirmado (si es requerido)
- [ ] Contraseña escrita correctamente
- [ ] URL del sitio configurada en Supabase Auth Settings
- [ ] Sin errores en la consola del navegador
