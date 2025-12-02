/*
  # Agregar campo secret_code a premium_apps

  1. Cambios
    - Agregar campo `secret_code` (text, nullable) a la tabla `premium_apps`
    - Este campo almacenará un código secreto opcional para desbloquear funcionalidades adicionales
    - Solo se mostrará a usuarios con suscripción activa cuando el campo tenga un valor
*/

-- Agregar campo secret_code a premium_apps
ALTER TABLE premium_apps 
ADD COLUMN IF NOT EXISTS secret_code text;







