# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación en Vercel para hacer pruebas.

## Prerrequisitos

1. **Cuenta en Vercel**: Si no tienes una, créala en [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Tu código debe estar en un repositorio (recomendado)

## Pasos para Desplegar

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   ```bash
   git add .
   git commit -m "Preparado para Vercel"
   git push origin main
   ```

2. **Conecta con Vercel**:
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

3. **Configura las Variables de Entorno**:
   En la sección "Environment Variables", agrega:

   ```
   VITE_SUPABASE_URL=https://pezisfaeecgjdguneuip.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   VITE_STRIPE_PUBLISHABLE_KEY=tu-publishable-key-aqui
   ```

4. **Despliega**:
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente

### Opción 2: Despliegue desde la CLI de Vercel

1. **Instala Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Inicia sesión**:
   ```bash
   vercel login
   ```

3. **Despliega**:
   ```bash
   vercel
   ```

4. **Configura variables de entorno**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY
   ```

5. **Despliega a producción**:
   ```bash
   vercel --prod
   ```

## Variables de Entorno Necesarias

Asegúrate de configurar estas variables en Vercel:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://pezisfaeecgjdguneuip.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGci...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | `pk_test_...` |

### Cómo encontrar tus variables:

1. **Supabase**:
   - Ve a tu proyecto en Supabase
   - Settings > API
   - Copia `Project URL` y `anon public` key

2. **Stripe**:
   - Ve a Stripe Dashboard
   - Developers > API keys
   - Copia la `Publishable key` (test o live según corresponda)

## Configuración Automática

El archivo `vercel.json` ya está configurado para:
- ✅ Detectar Vite automáticamente
- ✅ Construir con `npm run build`
- ✅ Servir la aplicación desde `dist`
- ✅ Rutas SPA (Single Page Application)

## Verificar el Despliegue

Después del despliegue:

1. **Prueba la URL de producción** que Vercel te proporciona
2. **Verifica que las variables de entorno estén configuradas**:
   - Abre DevTools > Console
   - No deberías ver errores de variables faltantes

## Actualizaciones Futuras

Cada vez que hagas `git push`:
- Vercel detectará los cambios automáticamente
- Creará un preview del despliegue
- Después de aprobar, se desplegará a producción

## Notas Importantes

⚠️ **Variables de Entorno**:
- Las variables que empiezan con `VITE_` son visibles en el frontend
- NO uses la `SUPABASE_SERVICE_ROLE_KEY` aquí (solo en Edge Functions)
- La `STRIPE_SECRET_KEY` tampoco va aquí (solo en Edge Functions)

🔒 **Seguridad**:
- Solo usa las claves públicas en Vercel
- Las claves secretas permanecen en Supabase Edge Functions

## Solución de Problemas

### Error 400: "Invalid login credentials" ⚠️ **COMÚN DESPUÉS DEL DEPLOY**

**Síntomas**:
- Error en la UI: "Invalid login credentials"
- Error 400 en la consola del navegador
- No puedes iniciar sesión

**Causa más común**: Variables de entorno no configuradas o incorrectas en Vercel.

**Solución**:
1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Verifica que tengas estas 3 variables configuradas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
3. **IMPORTANTE**: Después de agregar/modificar variables, haz un **Redeploy**:
   - Ve a Deployments → 3 puntos (...) → Redeploy
   - Espera 2-3 minutos
4. Abre la consola del navegador (F12) y busca:
   - Mensaje "✅ Supabase configurado correctamente"
   - Si ves "❌ Faltante", las variables no están configuradas

**Para más detalles**: Ver `SOLUCION_ERROR_400_LOGIN.md`

### Error: "Cannot find module"
- Verifica que `node_modules` esté en `.gitignore`
- Vercel instalará las dependencias automáticamente

### Error: "Environment variable not found"
- Verifica que las variables empiecen con `VITE_`
- Asegúrate de haberlas configurado en Vercel Dashboard
- **Haz un Redeploy** después de agregar variables

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Verifica que `package.json` tenga el script `build`

## Soporte

Si tienes problemas, revisa:
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide/static-deploy.html#vercel)

