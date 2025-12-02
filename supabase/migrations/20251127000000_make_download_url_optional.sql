/*
  # Hacer opcional el campo download_url en premium_apps

  1. Cambios
    - Modificar el campo `download_url` para permitir valores NULL en la tabla `premium_apps`
    - Este campo ahora será opcional al crear o editar una aplicación premium
*/

-- Hacer opcional el campo download_url
ALTER TABLE premium_apps 
ALTER COLUMN download_url DROP NOT NULL;

