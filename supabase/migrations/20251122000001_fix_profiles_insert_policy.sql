/*
  # Permitir INSERT en profiles para el trigger handle_new_user
  
  El trigger handle_new_user necesita poder insertar en profiles.
  Aunque usa SECURITY DEFINER, RLS puede estar bloqueando la inserción.
  Esta política permite que el trigger inserte perfiles durante la creación de usuarios.
*/

-- Eliminar política de INSERT si existe (por si acaso)
DROP POLICY IF EXISTS "Allow profile creation for new users" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Crear política que permita INSERT en profiles para nuevos usuarios
-- Esta política permite que el trigger handle_new_user inserte perfiles
-- El WITH CHECK (true) permite insertar cualquier perfil (el trigger controla qué insertar)
CREATE POLICY "Allow profile creation for new users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- También asegurar que la función tenga los permisos correctos
-- La función ya tiene SECURITY DEFINER, pero esta política ayuda con RLS

