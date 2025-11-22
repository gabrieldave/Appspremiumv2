# 🔐 Cómo Activar Stripe Billing Portal en Producción

## 📋 Pasos para Activar el Billing Portal

### 1. Acceder a la Configuración

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. **IMPORTANTE**: Asegúrate de estar en **modo Live** (no Test mode)
   - Verifica el toggle en la esquina superior derecha
3. Ve a: **Settings** → **Billing** → **Customer portal**

### 2. Activar el Portal

1. En la página de "Customer portal", verás dos opciones:
   - **"Activate test link"** (para modo Test)
   - **"Activate"** (para modo Live) ← **Esta es la que necesitas**

2. Haz clic en **"Activate"** (el botón azul para modo Live)

3. Confirma la activación si te lo pide

### 3. Configurar Permisos del Portal

Después de activar, configura qué pueden hacer los usuarios:

#### Permisos Recomendados:

✅ **Permitir cancelar suscripciones**
   - Los usuarios pueden cancelar sus suscripciones desde el portal

✅ **Permitir actualizar método de pago**
   - Los usuarios pueden cambiar su tarjeta de crédito

✅ **Permitir ver historial de facturación**
   - Los usuarios pueden ver sus facturas pasadas

✅ **Permitir actualizar información de facturación**
   - Los usuarios pueden actualizar su dirección de facturación

#### Configuración Adicional:

- **Business information**: Agrega el nombre de tu negocio
- **Branding**: Personaliza colores y logo (opcional)
- **Email notifications**: Configura qué emails se envían a los usuarios

### 4. Guardar Cambios

1. Después de configurar los permisos, haz clic en **"Save changes"** o **"Guardar cambios"**
2. El portal estará activo inmediatamente

---

## ✅ Verificación

Para verificar que el portal está activo:

1. En Stripe Dashboard → Settings → Billing → Customer portal
2. Deberías ver:
   - ✅ Estado: **"Active"** (no "Test link active")
   - ✅ URL del portal visible
   - ✅ Permisos configurados

---

## 🔗 Cómo Funciona en tu Aplicación

Una vez activado, tu aplicación puede usar la Edge Function `stripe-portal` para:

1. **Crear sesiones del portal** para usuarios autenticados
2. **Permitir que usuarios gestionen sus suscripciones** sin salir de tu app
3. **Cancelar, actualizar o reactivar suscripciones** desde el portal

### Ejemplo de Uso:

Cuando un usuario hace clic en "Gestionar suscripción" en tu app:
- Tu frontend llama a: `/functions/v1/stripe-portal`
- La Edge Function crea una sesión del portal
- El usuario es redirigido al portal de Stripe
- Puede gestionar su suscripción
- Después, es redirigido de vuelta a tu app

---

## ⚠️ Notas Importantes

1. **Modo Live vs Test**:
   - El portal de **Test** y **Live** son independientes
   - Asegúrate de activar el portal en **modo Live** para producción

2. **Permisos**:
   - Los permisos que configures aplican a todos los usuarios
   - Puedes cambiar los permisos en cualquier momento

3. **Branding**:
   - Puedes personalizar el portal con tu logo y colores
   - Esto mejora la experiencia del usuario

4. **Seguridad**:
   - Solo usuarios autenticados pueden acceder al portal
   - Stripe maneja toda la seguridad del portal

---

## 🆘 Solución de Problemas

### El botón "Activate" no aparece:
- Verifica que estés en **modo Live** (no Test)
- Verifica que tu cuenta de Stripe esté completamente verificada

### Los usuarios no pueden acceder al portal:
- Verifica que la Edge Function `stripe-portal` esté desplegada
- Verifica que `STRIPE_SECRET_KEY` esté configurada correctamente
- Revisa los logs de la Edge Function en Supabase

### El portal no muestra las opciones esperadas:
- Verifica los permisos configurados en Stripe Dashboard
- Asegúrate de haber guardado los cambios

---

## ✅ Checklist

- [ ] Stripe Dashboard en modo **Live**
- [ ] Navegar a Settings → Billing → Customer portal
- [ ] Click en **"Activate"** (no "Activate test link")
- [ ] Configurar permisos recomendados
- [ ] Guardar cambios
- [ ] Verificar que el estado sea "Active"
- [ ] Probar el portal desde tu aplicación

---

¡Listo! El Billing Portal estará activo y tus usuarios podrán gestionar sus suscripciones.


