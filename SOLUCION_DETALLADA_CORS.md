# 🔧 Solución Detallada: Error de CORS Persistente

## ❌ Problema Actual

El error de CORS persiste incluso después de actualizar el código:

```
Access to fetch at 'https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-checkout' 
from origin 'https://www.todossomostraders.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## 🔍 Análisis del Problema

El error indica que:
1. El navegador envía una solicitud **OPTIONS** (preflight)
2. La respuesta **NO tiene un status HTTP ok** (200/204)
3. El navegador bloquea la solicitud POST posterior

## ✅ Soluciones a Probar (en orden)

### Solución 1: Verificar que la Función Está Desplegada Correctamente

1. **Ve a Supabase Dashboard** → Edge Functions → `stripe-checkout`
2. **Verifica el código**:
   - Debe tener el manejo de OPTIONS al inicio
   - Debe retornar status 200 con headers CORS
3. **Revisa los logs**:
   - Edge Functions → `stripe-checkout` → **Logs**
   - Busca errores cuando se hace una solicitud OPTIONS
   - Si ves errores, la función puede estar fallando antes de responder

### Solución 2: Verificar Variables de Entorno

Asegúrate de que **TODAS** estas variables estén configuradas en Edge Functions Secrets:

- ✅ `SUPABASE_URL` = `https://pezisfaeecgjdguneuip.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)
- ✅ `STRIPE_SECRET_KEY` = (tu Stripe secret key)

**Si falta alguna**, la función puede fallar al inicializarse, incluso en OPTIONS.

### Solución 3: Probar la Función Directamente

1. **Abre la consola del navegador** (F12)
2. **Ejecuta este código** para probar OPTIONS:

```javascript
fetch('https://pezisfaeecgjdguneuip.supabase.co/functions/v1/stripe-checkout', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://www.todossomostraders.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization,content-type'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', [...response.headers.entries()]);
  return response.text();
})
.then(text => console.log('Body:', text))
.catch(error => console.error('Error:', error));
```

**Si el status NO es 200**, hay un problema con la función.

### Solución 4: Verificar Configuración de Supabase

1. **Authentication → URL Configuration**:
   - Site URL: `https://todossomostraders.com` (con https://)
   - Redirect URLs: Debe incluir `https://www.todossomostraders.com/**`

2. **Settings → API**:
   - Verifica que no haya restricciones de CORS adicionales

### Solución 5: Verificar que el Código Está Actualizado

El código actualizado debe tener:

```typescript
Deno.serve(async (req) => {
  // Manejar preflight CORS PRIMERO, antes de cualquier otra cosa
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  // ... resto del código
});
```

**Verifica que este código esté en la función desplegada**.

### Solución 6: Agregar Logging para Debug

Si el problema persiste, agrega logging temporal:

```typescript
Deno.serve(async (req) => {
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  // ... resto
});
```

Luego revisa los logs en Supabase Dashboard para ver si OPTIONS está llegando.

### Solución 7: Verificar desde el Cliente

El código del cliente debe estar haciendo la solicitud correctamente:

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({...}),
});
```

**Verifica que `supabaseUrl` sea correcto** y que el token de autenticación esté presente.

## 🆘 Si Nada Funciona

1. **Contacta a Soporte de Supabase**:
   - Puede ser un problema del lado de Supabase
   - Menciona que las Edge Functions no están respondiendo correctamente a OPTIONS

2. **Verifica el dominio en Vercel**:
   - Asegúrate de que `www.todossomostraders.com` esté correctamente configurado
   - Verifica los registros DNS

3. **Prueba desde localhost**:
   - Si funciona en localhost pero no en producción, es un problema de configuración de dominio
   - Si no funciona en ninguno, es un problema del código

## 📝 Checklist de Verificación

- [ ] Función `stripe-checkout` desplegada con código actualizado
- [ ] Todas las variables de entorno configuradas
- [ ] Site URL y Redirect URLs configurados en Supabase
- [ ] Dominio configurado en Vercel
- [ ] Logs de la función revisados
- [ ] Prueba de OPTIONS ejecutada en consola
- [ ] Código del cliente verificado

---

**Última actualización**: Análisis detallado del error de CORS persistente

