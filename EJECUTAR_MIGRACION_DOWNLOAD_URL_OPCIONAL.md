# Ejecutar Migración: Hacer opcional download_url

## 📋 Instrucciones para Ejecutar la Migración

### Opción 1: Dashboard de Supabase (Recomendado)

1. **Abre el Dashboard de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto: **pezisfaeecgjdguneuip**

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **SQL Editor**
   - O ve directamente a: https://supabase.com/dashboard/project/pezisfaeecgjdguneuip/sql/new

3. **Copia y pega el siguiente SQL:**

```sql
-- Hacer opcional el campo download_url
ALTER TABLE premium_apps 
ALTER COLUMN download_url DROP NOT NULL;
```

4. **Ejecuta el SQL**
   - Haz clic en el botón **Run** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Deberías ver un mensaje de éxito: "Success. No rows returned"

5. **Verifica que funcionó**
   - Ve a **Table Editor** → **premium_apps**
   - El campo `download_url` ahora debería permitir valores NULL

---

### Opción 2: Usando Supabase CLI (Si está instalado)

Si tienes Supabase CLI instalado, puedes ejecutar:

```bash
supabase migration up
```

Esto ejecutará automáticamente la migración:
- `20251127000000_make_download_url_optional.sql`

---

## ✅ Verificación

Después de ejecutar la migración, puedes verificar que funcionó:

1. **En el Dashboard:**
   - Ve a **Table Editor** → **premium_apps**
   - Intenta editar una app y deja el campo `download_url` vacío
   - Debería guardar sin problemas

2. **En la aplicación:**
   - Ve al panel de administración → **Gestionar Apps Premium**
   - Al crear o editar una app, el campo "URL de Descarga" debería ser opcional (sin asterisco)
   - Puedes dejarlo vacío y guardar sin errores

---

## 🎯 ¿Qué hace esta migración?

- **Quita la restricción NOT NULL** del campo `download_url` en la tabla `premium_apps`
- Ahora el campo puede ser `NULL`, lo que permite que sea opcional al crear o editar apps
- Esto resuelve el error: `null value in column "download_url" violates not-null constraint`

---

## ⚠️ Nota Importante

Esta migración es segura y no afecta los datos existentes. Solo cambia la estructura de la tabla para permitir valores NULL.

