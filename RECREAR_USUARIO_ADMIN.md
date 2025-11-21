# 🔐 Recrear Usuario y Hacerlo Admin

## 📋 Pasos Completos

### Paso 1: Eliminar el Usuario Actual

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium**
3. Ve a **Authentication** → **Users**
4. Haz clic en el usuario `david.del.rio.colin@gmail.com`
5. Busca el botón **"Delete User"** o **"Eliminar Usuario"**
6. Haz clic y confirma la eliminación

### Paso 2: Crear Nuevo Usuario desde la App

1. Ve a tu app: `https://todossomostraders.com`
2. Haz clic en **"¿No tienes cuenta? Regístrate"**
3. Completa el formulario:
   - **Email**: `david.del.rio.colin@gmail.com`
   - **Contraseña**: (elige una nueva que recuerdes, mín. 6 caracteres)
4. Haz clic en **"Crear Cuenta"**
5. Espera a que se cree el usuario

### Paso 3: Hacer el Usuario Admin (Usando SQL)

Después de crear el usuario, necesitas hacerlo admin ejecutando SQL:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **Appspremium**
3. Ve a **SQL Editor** (en el menú lateral)
4. Haz clic en **"New query"** o **"Nueva consulta"**
5. Copia y pega este código SQL:

```sql
-- Hacer admin al usuario con email david.del.rio.colin@gmail.com
UPDATE profiles
SET is_admin = true
WHERE email = 'david.del.rio.colin@gmail.com';
```

6. Haz clic en **"Run"** o **"Ejecutar"** (botón verde)
7. Deberías ver: `Success. No rows returned` o similar

### Paso 4: Verificar que Funcionó

1. Ve a **SQL Editor** nuevamente
2. Ejecuta esta consulta para verificar:

```sql
-- Verificar que el usuario es admin
SELECT id, email, is_admin 
FROM profiles 
WHERE email = 'david.del.rio.colin@gmail.com';
```

3. Deberías ver `is_admin: true`

### Paso 5: Iniciar Sesión

1. Ve a tu app: `https://todossomostraders.com`
2. Haz clic en **"Iniciar Sesión"**
3. Ingresa:
   - **Email**: `david.del.rio.colin@gmail.com`
   - **Contraseña**: (la que creaste en el Paso 2)
4. Haz clic en **"Iniciar Sesión"**
5. Deberías poder iniciar sesión y ver las opciones de admin

---

## 🚀 Script Completo (Todo en Uno)

Si prefieres hacer todo con SQL (eliminar y recrear), puedes usar este script en **SQL Editor**:

```sql
-- PASO 1: Eliminar el usuario (si existe)
DELETE FROM auth.users 
WHERE email = 'david.del.rio.colin@gmail.com';

-- NOTA: Después de ejecutar esto, necesitas crear el usuario desde la app.
-- Luego ejecuta el siguiente paso para hacerlo admin:
```

Después de crear el usuario desde la app, ejecuta:

```sql
-- PASO 2: Hacer admin al usuario
UPDATE profiles
SET is_admin = true
WHERE email = 'david.del.rio.colin@gmail.com';
```

---

## ✅ Checklist

- [ ] Paso 1: Usuario eliminado desde Supabase Dashboard
- [ ] Paso 2: Usuario creado desde la app
- [ ] Paso 3: SQL ejecutado para hacer admin
- [ ] Paso 4: Verificado con consulta SQL
- [ ] Paso 5: Login exitoso y opciones de admin visibles

---

## 🔍 Verificar que Eres Admin

Después de iniciar sesión, deberías ver:

1. **Opción de Admin en el menú**:
   - En el portal, debería haber un enlace a "Admin" o "Administración"
   
2. **Desde SQL Editor**, puedes verificar:

```sql
-- Ver todos los admins
SELECT id, email, is_admin, created_at
FROM profiles
WHERE is_admin = true;
```

---

## ❓ Solución de Problemas

### Si no puedes eliminar el usuario desde la UI:

Ejecuta en **SQL Editor**:

```sql
-- Eliminar manualmente el usuario
DELETE FROM auth.users 
WHERE email = 'david.del.rio.colin@gmail.com';
```

**⚠️ Importante**: Esto eliminará el usuario de autenticación, pero también deberías eliminar el perfil:

```sql
-- Eliminar el perfil asociado
DELETE FROM profiles 
WHERE email = 'david.del.rio.colin@gmail.com';
```

### Si el UPDATE no funciona:

Verifica que el usuario existe:

```sql
-- Ver si el usuario existe
SELECT * FROM profiles WHERE email = 'david.del.rio.colin@gmail.com';
```

Si no existe, espera unos segundos después de crear el usuario desde la app, ya que hay un trigger que crea el perfil automáticamente.

---

## 💡 Nota Importante

Después de crear el usuario desde la app, puede tomar unos segundos para que el trigger cree el perfil en la tabla `profiles`. Si el UPDATE no funciona inmediatamente:

1. Espera 5-10 segundos
2. Verifica que el perfil existe con la consulta de arriba
3. Ejecuta el UPDATE nuevamente

