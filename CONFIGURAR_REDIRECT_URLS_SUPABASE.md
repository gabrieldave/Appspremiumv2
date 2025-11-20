# 🔧 Configurar URLs de Redirección en Supabase

## ❌ Problema Actual

Cuando haces reset de contraseña o confirmas email, Supabase te redirige a:
- ❌ `localhost:3000` (tu servidor local, que no está corriendo)

Pero tu app está en:
- ✅ `https://appspremiumv2.vercel.app` (tu URL de producción)

---

## ✅ Solución: Configurar URLs en Supabase

### Paso 1: Ve a la Configuración de Auth en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium** (`pezisfaeecgjdguneuip`)
3. Ve a **Authentication** → **Settings** (o **Configuration**)

### Paso 2: Configurar Site URL

1. Busca la sección **"URL Configuration"** o **"Redirect URLs"**
2. En **"Site URL"**, cambia de:
   ```
   http://localhost:3000
   ```
   a:
   ```
   https://appspremiumv2.vercel.app
   ```
   (O la URL que Vercel te haya dado para tu proyecto)

### Paso 3: Configurar Redirect URLs

1. En **"Redirect URLs"** o **"Additional Redirect URLs"**, agrega estas URLs:

   ```
   https://appspremiumv2.vercel.app/**
   https://appspremiumv2.vercel.app
   http://localhost:3000/**
   http://localhost:3000
   ```

   **Explicación**:
   - Las primeras dos son para producción (Vercel)
   - Las últimas dos son para desarrollo local (opcional, pero útil)

2. **IMPORTANTE**: El `/**` al final significa "cualquier ruta", así que `/`, `/dashboard`, `/login`, etc., todas funcionarán.

### Paso 4: Guardar

1. Haz clic en **"Save"** o **"Guardar"**
2. Espera unos segundos para que se apliquen los cambios

---

## 🎯 URLs que Necesitas Configurar

Reemplaza `appspremiumv2.vercel.app` con tu URL real de Vercel si es diferente:

### Site URL:
```
https://appspremiumv2.vercel.app
```

### Redirect URLs (una por línea o separadas por comas):
```
https://appspremiumv2.vercel.app/**
https://appspremiumv2.vercel.app
http://localhost:3000/**
http://localhost:3000
```

---

## 🔍 Cómo Encontrar tu URL de Vercel

Si no sabes cuál es tu URL de Vercel:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Verás la URL en la parte superior, algo como:
   - `https://appspremiumv2.vercel.app`
   - `https://appspremiumv2-xyz.vercel.app`

---

## ✅ Después de Configurar

1. **Prueba el reset de contraseña de nuevo**:
   - Ve a Supabase → Authentication → Users
   - Haz clic en tu usuario
   - Resetea la contraseña
   - Debería redirigir a tu URL de Vercel ahora

2. **Si aún no funciona**:
   - Espera 1-2 minutos para que los cambios se propaguen
   - Intenta de nuevo
   - Verifica que copiaste la URL correcta (con https://)

---

## 🆘 Solución Temporal: Usar el Token Manualmente

Si necesitas usar el reset de contraseña ahora mismo y no puedes esperar a configurar:

1. **Copia el token de la URL**:
   - La URL tiene algo como: `localhost:3000/#access_token=eyJhbGc...`
   - Copia solo la parte del `access_token`

2. **Ve a tu app en Vercel**:
   - Abre `https://appspremiumv2.vercel.app`

3. **En la consola del navegador (F12)**, ejecuta:
   ```javascript
   const token = 'PEGA_AQUI_EL_ACCESS_TOKEN';
   const { data, error } = await supabase.auth.setSession({
     access_token: token,
     refresh_token: '' // Puede estar vacío
   });
   console.log('Session:', { data, error });
   ```

4. **Si funciona**, podrás iniciar sesión y cambiar tu contraseña desde la app.

---

## 📝 Checklist

- [ ] Ir a Supabase Dashboard → Authentication → Settings
- [ ] Cambiar Site URL a tu URL de Vercel
- [ ] Agregar Redirect URLs (producción y desarrollo)
- [ ] Guardar los cambios
- [ ] Probar reset de contraseña de nuevo
- [ ] Verificar que redirige a Vercel y no a localhost

---

## 💡 Nota Importante

**Para desarrollo local**, si también quieres usar reset de contraseña localmente:

1. Asegúrate de tener `http://localhost:3000/**` en Redirect URLs
2. Cuando trabajes localmente, las redirecciones irán a localhost
3. Cuando trabajes en producción, las redirecciones irán a Vercel

¡Eso es todo! Después de configurar esto, el reset de contraseña debería funcionar correctamente.
