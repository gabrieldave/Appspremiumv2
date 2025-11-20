# Requisitos para Implementación del Proyecto AppsPremium

## 📋 Resumen Ejecutivo
Este documento lista todos los requisitos previos necesarios para implementar y desplegar la aplicación AppsPremium antes de proceder con la configuración.

---

## 🔐 1. Variables de Entorno Necesarias

### Frontend (`.env` en la raíz del proyecto)
```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# Stripe Configuration (opcional, si se usa en frontend)
# VITE_STRIPE_PUBLISHABLE_KEY=tu_publishable_key
```

### Supabase Edge Functions (Configurar en Supabase Dashboard)
```env
# Requeridas en todas las Edge Functions
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
STRIPE_SECRET_KEY=tu_stripe_secret_key

# Requerida solo en stripe-webhook
STRIPE_WEBHOOK_SECRET=tu_webhook_secret
```

---

## 🗄️ 2. Configuración de Supabase

### 2.1 Proyecto Supabase
- ✅ Crear un proyecto nuevo en [supabase.com](https://supabase.com)
- ✅ Obtener las siguientes credenciales:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (¡MANTENER SECRETO!)

### 2.2 Base de Datos - Aplicar Migraciones
**IMPORTANTE**: Aplicar todas las migraciones en orden cronológico:

1. `20251108170214_create_initial_schema.sql` - Schema inicial
2. `20251108173336_throbbing_meadow.sql` - Tablas de Stripe (customers, subscriptions, orders)
3. `20251108183611_add_admin_roles.sql` - Sistema de roles admin
4. `20251108201609_fix_rls_performance_and_security.sql` - Mejoras de seguridad
5. `20251108205007_fix_rls_profile_read_policy.sql` - Fix políticas RLS
6. `20251109003333_create_stripe_prices_table.sql` - Tabla de precios
7. `20251109004935_sync_profiles_from_stripe_subscriptions.sql` - Sincronización de perfiles
8. `20251111001657_create_mt4_product_system.sql` - Sistema de productos MT4
9. `20251111005314_fix_security_and_performance_issues.sql` - Fixes de seguridad
10. `20251111005503_fix_profiles_rls_for_admins.sql` - Fix RLS admins
11. Y todas las demás migraciones en orden...

**Opción 1: Usando Supabase CLI** (Recomendado)
```bash
supabase db push
```

**Opción 2: Manual**
- Ir a SQL Editor en Supabase Dashboard
- Ejecutar cada migración en orden

### 2.3 Storage Buckets (Opcional pero Recomendado)
Crear bucket público para assets:
- **Nombre**: `logos`
- **Público**: ✅ Sí
- Subir logo en: `logos/Logo.jpg`

---

## 💳 3. Configuración de Stripe

### 3.1 Cuenta Stripe
- ✅ Crear cuenta en [stripe.com](https://stripe.com)
- ✅ Configurar cuenta (modo Test o Production según necesidades)

### 3.2 Obtener Claves API
En Stripe Dashboard → Developers → API keys:
- `STRIPE_SECRET_KEY` (clave secreta, nunca exponer)
- `STRIPE_PUBLISHABLE_KEY` (opcional, solo si se usa en frontend)

### 3.3 Configurar Productos y Precios en Stripe
1. **Crear Producto en Stripe**:
   - Nombre: "Señales VIP Trading Sin Perdidas"
   - Tipo: Suscripción recurrente
   - Precio: $15.00 USD (o el precio deseado)
   - Frecuencia: Mensual

2. **Obtener Price ID**:
   - Después de crear el producto, copiar el `price_id` (ejemplo: `price_1SRFznG2B99hBCya4vFOfnbY`)

3. **Actualizar en Base de Datos**:
   - La migración `20251109003333_create_stripe_prices_table.sql` inserta un precio por defecto
   - **IMPORTANTE**: Actualizar el `price_id` en la tabla `stripe_prices` con el price_id real de Stripe
   - O actualizar el valor en la migración antes de ejecutarla

4. **Configurar Stripe Billing Portal** (Requerido para stripe-portal):
   - Ir a Stripe Dashboard → Settings → Billing → Customer portal
   - Habilitar el portal de clientes
   - Configurar permisos (cancelar suscripción, actualizar método de pago, etc.)

### 3.4 Configurar Webhook de Stripe
**CRÍTICO**: Necesario para sincronizar suscripciones automáticamente

1. **En Stripe Dashboard**:
   - Ir a Developers → Webhooks
   - Click en "Add endpoint"

2. **Configurar Endpoint**:
   - URL: `https://[TU_PROYECTO].supabase.co/functions/v1/stripe-webhook`
   - Eventos a escuchar:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `payment_intent.succeeded`
     - Todos los eventos de `customer.subscription.*`

3. **Obtener Webhook Secret**:
   - Después de crear el webhook, copiar el "Signing secret"
   - Usar este valor como `STRIPE_WEBHOOK_SECRET` en la Edge Function

---

## 🚀 4. Edge Functions de Supabase

### 4.1 Desplegar Edge Functions
Todas las funciones deben estar desplegadas en Supabase:

1. **stripe-checkout** - Crear sesiones de checkout
2. **stripe-webhook** - Manejar eventos de webhook de Stripe
3. **stripe-portal** - Crear sesiones del portal de facturación
4. **delete-user** - (Opcional) Eliminar usuarios

**Comando para desplegar**:
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy stripe-portal
supabase functions deploy delete-user  # opcional
```

### 4.2 Configurar Variables de Entorno en Edge Functions
En Supabase Dashboard → Edge Functions → Settings:
- Agregar todas las variables de entorno listadas en la sección 1

---

## 👤 5. Configuración Inicial de Usuario Admin

### 5.1 Crear Primer Usuario Admin
Después de aplicar las migraciones:

1. **Registrar un usuario** a través de la aplicación o Supabase Dashboard
2. **Ejecutar SQL** para convertirlo en admin:
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'tu_email@ejemplo.com';
```

---

## 📦 6. Dependencias del Proyecto

### 6.1 Instalar Dependencias
```bash
npm install
```

### 6.2 Verificar Dependencias Principales
El proyecto requiere:
- React 18+
- TypeScript
- Vite
- Supabase JS Client
- React Router v7
- Tailwind CSS
- Lucide React (iconos)

---

## ✅ 7. Checklist de Verificación Pre-Implementación

### Supabase
- [ ] Proyecto creado
- [ ] Todas las migraciones aplicadas
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de seguridad verificadas
- [ ] Edge Functions desplegadas
- [ ] Variables de entorno configuradas en Edge Functions
- [ ] Bucket de Storage creado (opcional)

### Stripe
- [ ] Cuenta creada
- [ ] Claves API obtenidas
- [ ] Producto y precio creados
- [ ] Price ID actualizado en base de datos
- [ ] Billing Portal configurado
- [ ] Webhook configurado y funcionando
- [ ] Webhook secret configurado en Edge Function

### Aplicación
- [ ] Variables de entorno configuradas en `.env`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto compila sin errores (`npm run build`)
- [ ] Usuario admin creado

### Pruebas Iniciales
- [ ] Login/Registro funciona
- [ ] Stripe Checkout funciona (modo test)
- [ ] Webhook de Stripe recibe eventos
- [ ] Sincronización de suscripción funciona
- [ ] Portal de usuario accesible con suscripción activa
- [ ] Panel de admin accesible con usuario admin

---

## 🔧 8. Configuración Adicional Recomendada

### 8.1 Dominio Personalizado
- Configurar dominio personalizado en Supabase
- Configurar dominio personalizado en Stripe (para checkout)

### 8.2 Email Templates
- Configurar templates de email en Supabase Auth
- Personalizar emails de confirmación

### 8.3 Analytics y Monitoreo
- Configurar logging en Edge Functions
- Configurar monitoreo de errores (Sentry, etc.)
- Configurar analytics (opcional)

---

## ⚠️ 9. Consideraciones Importantes

### Seguridad
- ⚠️ **NUNCA** exponer `SUPABASE_SERVICE_ROLE_KEY` en el frontend
- ⚠️ **NUNCA** exponer `STRIPE_SECRET_KEY` en el frontend
- ⚠️ Usar siempre variables de entorno para credenciales
- ⚠️ Verificar RLS está habilitado en todas las tablas

### Ambiente de Producción
- Usar claves de Stripe de producción cuando estés listo
- Configurar webhook de producción con URL de producción
- Verificar que todas las URLs apuntan a producción
- Configurar backups automáticos en Supabase

### Testing
- Probar todo el flujo de suscripción en modo test primero
- Verificar webhooks funcionan correctamente
- Probar cancelación y reactivación de suscripciones

---

## 📝 10. Notas Adicionales

- El proyecto usa el campo `profiles.stripe_customer_id` pero también hay una tabla `stripe_customers` separada. Ambos sistemas coexisten.
- La sincronización de perfiles desde `stripe_subscriptions` se hace automáticamente vía trigger.
- Los productos MT4 (Alpha Strategy, Alpha Lite) se asignan manualmente por admins.
- El acceso a descargas está controlado por productos asignados, no solo por suscripción.

---

## 🆘 Soporte

Si encuentras problemas durante la implementación:
1. Revisar logs de Edge Functions en Supabase Dashboard
2. Revisar logs de webhooks en Stripe Dashboard
3. Verificar políticas RLS en Supabase
4. Verificar que todas las migraciones se aplicaron correctamente
