/*
  # Agregar campo web_app_url a premium_apps

  1. Cambios
    - Agregar campo `web_app_url` (text, nullable) a la tabla `premium_apps`
    - Este campo almacenará la URL de la aplicación web (opcional)
    - Solo se mostrará el botón "APP WEB" si este campo tiene un valor
*/

-- Agregar campo web_app_url a premium_apps
ALTER TABLE premium_apps 
ADD COLUMN IF NOT EXISTS web_app_url text;



