# 🔐 Cambiar Contraseña Manualmente en Supabase

## Problema
No puedes cambiar la contraseña desde el Dashboard de Supabase porque no hay una interfaz para eso. Las contraseñas están hasheadas por seguridad.

## ✅ Soluciones Disponibles

### Solución 1: Registrarse de Nuevo (MÁS SIMPLE)

1. **Ve a tu app en Vercel**:
   - Abre `https://appspremiumv2.vercel.app` (o tu URL de Vercel)

2. **Intenta registrarte**:
   - Click en "¿No tienes cuenta? Regístrate"
   - Email: `david.del.rio.colin@gmail.com`
   - Contraseña: (elige una nueva, mín. 6 caracteres)
   - Click en "Crear Cuenta"

3. **Si dice "Este email ya está registrado"**:
   - Ve a la Solución 2 (eliminar usuario)

### Solución 2: Eliminar y Recrear el Usuario

1. **Eliminar el usuario**:
   - Ve a [Supabase Dashboard](https://supabase.com/dashboard)
   - Authentication → Users
   - Haz clic en el usuario `david.del.rio.colin@gmail.com`
   - Busca "Delete User" o "Eliminar Usuario"
   - Confirma la eliminación

2. **Crear nuevo usuario**:
   - Ve a tu app en Vercel
   - Click en "Regístrate"
   - Email: `david.del.rio.colin@gmail.com`
   - Contraseña: (elige una nueva)
   - Click en "Crear Cuenta"

3. **Iniciar sesión**:
   - Usa las credenciales que acabas de crear

### Solución 3: Usar Reset de Contraseña (Después de Configurar URLs)

1. **Primero configurar URLs en Supabase** (ver `CONFIGURAR_REDIRECT_URLS_SUPABASE.md`):
   - Authentication → Settings
   - Site URL: `https://appspremiumv2.vercel.app`
   - Redirect URLs: `https://appspremiumv2.vercel.app/**`

2. **Resetear contraseña**:
   - Ve a tu app
   - Click en "¿Olvidaste tu contraseña?"
   - Ingresa tu email
   - Revisa tu correo
   - El link debería redirigir a Vercel (no localhost)

3. **Crear nueva contraseña**:
   - Sigue el link del email
   - Ingresa una nueva contraseña
   - Inicia sesión

### Solución 4: Desactivar Confirmación de Email (Temporal)

Si el problema es que el email no está confirmado:

1. Ve a Supabase Dashboard → Authentication → Settings
2. Busca "Enable Email Confirmations"
3. **Desactívalo** (toggle off)
4. Guarda
5. Intenta iniciar sesión de nuevo

⚠️ **Nota**: Esto es solo para pruebas. En producción es mejor mantenerlo activado.

---

## 🎯 Recomendación

**Para resolver rápido**: Usa la **Solución 2** (eliminar y recrear el usuario). Es la forma más rápida y directa.

1. Elimina el usuario desde Supabase
2. Regístrate desde la app con una contraseña que conozcas
3. Listo, ya puedes iniciar sesión

---

## ❓ ¿Qué Solución Usar?

- **Solución 1**: Si el registro funciona (email no existe o se actualiza)
- **Solución 2**: Si el registro falla con "ya está registrado" (MÁS RÁPIDA)
- **Solución 3**: Si quieres usar el flujo completo de reset de contraseña
- **Solución 4**: Si el problema es que el email no está confirmado

