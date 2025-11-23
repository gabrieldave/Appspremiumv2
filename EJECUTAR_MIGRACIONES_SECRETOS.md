# Ejecutar Migraciones: Campos Secretos

## 📋 Instrucciones para Ejecutar las Migraciones

### Opción 1: Dashboard de Supabase (Recomendado)

1. **Abre el Dashboard de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto: **pezisfaeecgjdguneuip**

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **SQL Editor**
   - O ve directamente a: https://supabase.com/dashboard/project/pezisfaeecgjdguneuip/sql/new

3. **Copia y pega el siguiente SQL:**

```sql
-- Agregar campo secret_code a premium_apps
ALTER TABLE premium_apps 
ADD COLUMN IF NOT EXISTS secret_code text;

-- Agregar campo secret_notes a premium_apps
ALTER TABLE premium_apps 
ADD COLUMN IF NOT EXISTS secret_notes text;
```

4. **Ejecuta el SQL**
   - Haz clic en el botón **Run** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Deberías ver un mensaje de éxito: "Success. No rows returned"

5. **Verifica que funcionó**
   - Ve a **Table Editor** → **premium_apps**
   - Deberías ver las nuevas columnas `secret_code` y `secret_notes` en la tabla

---

### Opción 2: Usando Supabase CLI (Si está instalado)

Si tienes Supabase CLI instalado, puedes ejecutar:

```bash
supabase migration up
```

Esto ejecutará automáticamente las migraciones:
- `20251126000000_add_secret_code_to_premium_apps.sql`
- `20251126000001_add_secret_notes_to_premium_apps.sql`

---

## ✅ Verificación

Después de ejecutar las migraciones, puedes verificar que funcionaron:

1. **En el Dashboard:**
   - Ve a **Table Editor** → **premium_apps**
   - Las columnas `secret_code` y `secret_notes` deberían aparecer

2. **En la aplicación:**
   - Ve al panel de administración → **Gestionar Apps Premium**
   - Al crear o editar una app, deberías ver los campos:
     - **Código Secreto (opcional)**
     - **Notas Secretas (opcional)**

---

## 🎯 ¿Qué hacen estas migraciones?

- **`secret_code`**: Campo de texto opcional para almacenar un código secreto que se mostrará a usuarios con suscripción activa
- **`secret_notes`**: Campo de texto opcional para almacenar notas secretas que se mostrarán a usuarios con suscripción activa

Ambos campos son **opcionales** - si no los configuras, simplemente no se mostrarán a los usuarios.

---

## 🚨 Solución de Problemas

Si encuentras algún error:

1. **Error: "column already exists"**
   - ✅ Esto es normal si ya ejecutaste la migración antes
   - Las migraciones usan `IF NOT EXISTS`, así que son seguras de ejecutar múltiples veces

2. **Error: "permission denied"**
   - Asegúrate de estar usando el SQL Editor del dashboard (tiene permisos de admin)
   - O verifica que tu service role key tenga los permisos correctos

3. **Las columnas no aparecen en la aplicación**
   - Verifica que ejecutaste el SQL correctamente
   - Refresca la página del dashboard
   - Reinicia el servidor de desarrollo si está corriendo



