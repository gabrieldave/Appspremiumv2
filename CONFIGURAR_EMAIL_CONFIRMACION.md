# Configuración de Email de Confirmación Personalizado

## Template Creado

Se ha creado un template HTML personalizado para el email de confirmación de registro en:
`supabase/templates/confirm-signup-email.html`

## Características del Template

- ✅ Branding completo de "Todos Somos Traders"
- ✅ Logo de la empresa
- ✅ Colores corporativos (azul a cyan)
- ✅ Diseño responsive y profesional
- ✅ Información sobre beneficios al confirmar
- ✅ Enlace de confirmación destacado
- ✅ Footer con información de la empresa

## Cómo Configurarlo en Supabase

### Opción 1: Usar el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Email Templates**
3. Selecciona **Confirm signup**
4. Copia el contenido del archivo `supabase/templates/confirm-signup-email.html`
5. Pega el contenido en el editor de templates
6. Asegúrate de mantener las variables de Supabase:
   - `{{ .ConfirmationURL }}` - URL de confirmación
   - `{{ .Year }}` - Año actual (opcional, puedes usar texto fijo)

### Opción 2: Configuración Avanzada con Variables

El template usa las siguientes variables de Supabase:
- `{{ .ConfirmationURL }}` - Enlace de confirmación generado automáticamente
- `{{ .Year }}` - Año actual (puedes reemplazarlo con el año fijo si prefieres)

### Personalización Adicional

Si quieres personalizar más el email:

1. **Cambiar colores**: Modifica los valores en `background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)`
2. **Cambiar logo**: Actualiza la URL en `src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg"`
3. **Agregar más información**: Edita la sección de beneficios o agrega más contenido

## Variables Disponibles en Supabase

Supabase proporciona estas variables en los templates:
- `{{ .ConfirmationURL }}` - URL de confirmación
- `{{ .Email }}` - Email del usuario
- `{{ .SiteURL }}` - URL de tu sitio
- `{{ .RedirectTo }}` - URL de redirección después de confirmar

## Notas Importantes

- El template está optimizado para clientes de email modernos
- Usa estilos inline para máxima compatibilidad
- El diseño es responsive y se adapta a móviles
- Mantén las variables de Supabase para que funcione correctamente

## Prueba el Email

Después de configurar el template:
1. Crea una cuenta de prueba
2. Verifica que recibes el email con el nuevo diseño
3. Confirma que el enlace de confirmación funciona correctamente

