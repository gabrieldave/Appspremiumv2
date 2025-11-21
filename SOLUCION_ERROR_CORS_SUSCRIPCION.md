# 🔧 Solución: Error de CORS al Suscribirse

## ❌ Problema

Cuando un usuario nuevo intenta suscribirse desde `www.todossomostraders.com`, aparece un error de CORS:

```
Access to fetch at 'https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-checkout' 
from origin 'https://www.todossomostraders.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## ✅ Soluciones

### Solución 1: Configurar Dominios Permitidos en Supabase (RECOMENDADO)

1. **Ve a Supabase Dashboard**:
   - Abre: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto: **Appspremium** (`pezisfaeecgjdguneuip`)

2. **Configurar Site URL y Redirect URLs**:
   - Ve a **Authentication** → **URL Configuration**
   - **Site URL**: `https://todossomostraders.com`
   - **Redirect URLs**: Agrega estas URLs (una por línea):
     ```
     https://todossomostraders.com/**
     https://todossomostraders.com
     https://www.todossomostraders.com/**
     https://www.todossomostraders.com
     http://localhost:5173/**
     http://localhost:5173
     ```

3. **⚠️ IMPORTANTE: CORS en Edge Functions**:
   - **Supabase NO tiene una configuración de CORS en el Dashboard**
   - Las Edge Functions manejan CORS directamente en el código
   - El código ya está configurado con `Access-Control-Allow-Origin: *` (permite todos los orígenes)
   - Si el error persiste, el problema puede ser que la Edge Function no está respondiendo correctamente al preflight OPTIONS

### Solución 2: Verificar que la Edge Function Maneja OPTIONS Correctamente

La función `stripe-checkout` ya tiene el manejo de CORS, pero verifica que esté desplegada correctamente:

1. **Ve a Edge Functions** en Supabase Dashboard
2. **Selecciona `stripe-checkout`**
3. **Verifica que el código tenga esta sección**:

```typescript
Deno.serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return corsResponse({}, 204);
  }
  // ... resto del código
});
```

4. **Si falta, actualiza la función** con el código de `supabase/functions/stripe-checkout/index.ts`

### Solución 3: Verificar Variables de Entorno en Vercel

Asegúrate de que las variables de entorno estén configuradas correctamente en Vercel:

1. **Ve a Vercel Dashboard** → Tu proyecto
2. **Settings** → **Environment Variables**
3. Verifica que estas variables estén configuradas:
   - `VITE_SUPABASE_URL` = `https://pezisfaeecgjdguneuip.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (tu anon key)

4. **Redeploy** después de verificar/actualizar las variables

### Solución 4: Verificar que el Dominio Está Configurado en Vercel

1. **Ve a Vercel Dashboard** → Tu proyecto
2. **Settings** → **Domains**
3. Verifica que estos dominios estén agregados:
   - `todossomostraders.com`
   - `www.todossomostraders.com`
4. **Verifica los registros DNS** si los dominios no están funcionando

## 🔍 Verificación

Después de aplicar las soluciones:

1. **Abre la consola del navegador** (F12)
2. **Intenta suscribirte de nuevo**
3. **Verifica que no aparezcan errores de CORS**
4. **Si aún hay errores**, revisa:
   - Los logs de la Edge Function en Supabase Dashboard
   - Los logs de Vercel para ver si hay errores en el build

## 📝 Notas Importantes

- **CORS en Supabase**: Supabase maneja CORS a nivel de API, no solo en Edge Functions
- **Preflight Requests**: Los navegadores envían una solicitud OPTIONS antes de POST, que debe responder con status 200/204
- **Dominios Múltiples**: Asegúrate de agregar tanto `todossomostraders.com` como `www.todossomostraders.com`

## 🆘 Si el Problema Persiste

1. **Revisa los logs de Supabase**:
   - Edge Functions → `stripe-checkout` → Logs
   - Busca errores relacionados con CORS o autenticación

2. **Verifica la autenticación**:
   - Asegúrate de que el usuario esté autenticado correctamente
   - Verifica que el token de autenticación se esté enviando en el header

3. **Prueba desde localhost**:
   - Si funciona en localhost pero no en producción, el problema es de configuración de dominio
   - Si no funciona en ninguno, el problema está en el código

---

**Última actualización**: Después de cambiar el dominio a `todossomostraders.com`

