/*
  # Mejorar manejo de errores en handle_new_user
  
  Este trigger mejora el manejo de errores para permitir que los usuarios
  se registren incluso si hay problemas al crear el perfil.
  También permite reutilizar emails después de eliminar usuarios.
*/

-- Recrear la función con mejor manejo de errores
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Deshabilitar RLS temporalmente para esta inserción
  -- SECURITY DEFINER debería ser suficiente, pero esto asegura que funcione
  SET LOCAL row_security = off;
  
  -- Intentar insertar el perfil, pero no fallar si ya existe o hay un error
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, solo loguearlo pero no bloquear la creación del usuario
    RAISE WARNING 'Error creando perfil para usuario %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


