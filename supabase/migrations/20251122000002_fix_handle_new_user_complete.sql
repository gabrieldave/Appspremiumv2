/*
  # Solución completa para handle_new_user
  
  Este script recrea la función handle_new_user de forma más robusta,
  asegurando que todos los campos requeridos tengan valores por defecto.
*/

-- Eliminar la función y trigger existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recrear la función con valores por defecto explícitos
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Insertar el perfil con todos los valores por defecto explícitos
  -- Esto evita problemas con RLS y campos NULL
  INSERT INTO public.profiles (id, email, subscription_status, is_admin, created_at, updated_at)
  VALUES (
    new.id, 
    new.email,
    'inactive'::text,
    false,
    COALESCE(new.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, loguearlo pero NO bloquear la creación del usuario
    -- Esto es crítico: el usuario debe poder registrarse incluso si falla el perfil
    RAISE WARNING 'Error creando perfil para usuario %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Asegurar que la política de INSERT existe
DROP POLICY IF EXISTS "Allow profile creation for new users" ON profiles;
CREATE POLICY "Allow profile creation for new users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);


