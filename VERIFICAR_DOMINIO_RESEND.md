# Verificar Dominio en Resend para Envío de Correos

## 🔴 Problema Actual

Los correos no se están enviando porque el dominio `todossomostraders.com` no está verificado en Resend. El error es:

```
The todosomostraders.com domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

## ✅ Solución Temporal (Funciona Inmediatamente)

He actualizado el código para usar el dominio de prueba de Resend (`onboarding@resend.dev`) por defecto. Esto funciona **inmediatamente** sin configuración adicional.

**Los correos ahora se enviarán desde**: `onboarding@resend.dev`

## 🔧 Solución Permanente: Verificar Tu Dominio

Para usar `noreply@todossomostraders.com` como remitente, necesitas verificar tu dominio en Resend:

### Pasos para Verificar el Dominio:

1. **Accede a Resend Dashboard**
   - Ve a: https://resend.com/domains
   - Inicia sesión con tu cuenta de Resend

2. **Agrega tu Dominio**
   - Haz clic en **"Add Domain"** o **"Agregar Dominio"**
   - Ingresa: `todossomostraders.com`
   - Haz clic en **"Add"**

3. **Configura los Registros DNS**
   - Resend te mostrará varios registros DNS que debes agregar
   - Necesitarás agregar:
     - **SPF Record** (TXT)
     - **DKIM Records** (TXT)
     - **DMARC Record** (TXT) - opcional pero recomendado

4. **Agrega los Registros en tu Proveedor DNS**
   - Ve al panel de control de tu proveedor DNS (donde compraste el dominio)
   - Agrega cada registro DNS que Resend te proporcionó
   - Espera a que se propaguen (puede tomar de minutos a horas)

5. **Verifica el Dominio**
   - Vuelve a Resend Dashboard
   - Haz clic en **"Verify"** o **"Verificar"**
   - Resend verificará que los registros DNS estén correctos

6. **Configura la Variable de Entorno**
   - Una vez verificado, ve a Supabase Dashboard
   - Edge Functions → Settings → Secrets
   - Agrega: `RESEND_FROM_EMAIL` = `Todos Somos Traders <noreply@todossomostraders.com>`
   - O simplemente: `noreply@todossomostraders.com`

7. **Redespliega las Edge Functions** (opcional)
   - Las funciones leerán automáticamente la nueva variable
   - Pero puedes redesplegarlas para asegurarte

## 💡 Recomendaciones: ¿Crear Otra Cuenta o Usar el Dominio de Prueba?

### ❌ NO Recomendado: Crear Otra Cuenta de Resend

**Razones:**
- Más complejo de gestionar (dos cuentas, dos API keys)
- Cada cuenta tiene su propio límite gratuito (100 emails/día)
- Más difícil de mantener y monitorear
- No resuelve el problema de tener que pagar por dominios adicionales

### ✅ Opción 1: Usar el Dominio de Prueba (RECOMENDADO para Desarrollo/Producción Pequeña)

**Ventajas:**
- ✅ **Gratis** - Sin costos adicionales
- ✅ **Funciona inmediatamente** - Ya está configurado
- ✅ **Sin límites de dominio** - Puedes usarlo en múltiples proyectos
- ✅ **Suficiente para la mayoría de casos** - Los correos llegan correctamente

**Desventajas:**
- El remitente será `onboarding@resend.dev` en lugar de `noreply@todossomostraders.com`
- Puede tener límites de envío según tu plan de Resend

**Conclusión**: Si el volumen de emails es bajo-medio (< 3,000/mes) y no necesitas un remitente personalizado, **esta es la mejor opción**.

### ✅ Opción 2: Verificar un Subdominio (RECOMENDADO para Producción Profesional)

**Ventajas:**
- ✅ Puede ser **más económico** que verificar el dominio principal
- ✅ Remitente profesional: `noreply@mail.todossomostraders.com`
- ✅ Mejor deliverability (menos probabilidad de spam)
- ✅ Puedes usar el mismo dominio en múltiples proyectos con diferentes subdominios

**Cómo hacerlo:**
1. En lugar de verificar `todossomostraders.com`, verifica `mail.todossomostraders.com`
2. O usa `noreply.todossomostraders.com` o `emails.todossomostraders.com`
3. Configura los registros DNS para el subdominio
4. Usa `noreply@mail.todossomostraders.com` como remitente

**Conclusión**: Si necesitas un remitente profesional y el volumen es alto, esta es la mejor opción.

### ✅ Opción 3: Pagar por el Dominio Adicional

Solo si:
- Necesitas absolutamente `noreply@todossomostraders.com` (sin subdominio)
- El volumen de emails justifica el costo
- Tienes presupuesto para ello

## 📝 Nota Importante

- **Solución Temporal/Recomendada**: Los correos funcionan ahora con `onboarding@resend.dev` ✅
- **Solución con Subdominio**: Verifica `mail.todossomostraders.com` para un remitente profesional
- **Solución con Dominio Principal**: Verifica `todossomostraders.com` (requiere pago si ya tienes otro dominio)
- Los correos funcionarán en todos los casos, solo cambia el remitente

## 🔍 Verificación

Después de verificar el dominio, prueba enviando un correo y verifica:
1. Que llegue correctamente
2. Que no vaya a spam
3. Que el remitente sea `noreply@todossomostraders.com`

## ⚠️ Si Tienes Problemas

- Verifica que todos los registros DNS estén correctos
- Espera hasta 48 horas para la propagación completa
- Contacta a Resend support si el dominio no se verifica después de 48 horas

