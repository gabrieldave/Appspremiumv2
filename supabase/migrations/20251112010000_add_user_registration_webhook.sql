/*
  # Trigger para notificar cuando se crea un nuevo usuario
  
  Este trigger llama a la Edge Function send-welcome-email cuando se crea un nuevo usuario.
  La función envía:
  1. Email de bienvenida al usuario
  2. Notificación al admin
  
  Nota: Requiere que la Edge Function esté desplegada y configurada con RESEND_API_KEY
*/

-- Función para llamar a la Edge Function cuando se crea un usuario
CREATE OR REPLACE FUNCTION notify_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url text;
  payload jsonb;
BEGIN
  -- URL de la Edge Function (ajusta según tu proyecto)
  function_url := current_setting('app.settings.edge_function_url', true);
  
  -- Si no está configurada, usar la URL por defecto
  IF function_url IS NULL OR function_url = '' THEN
    function_url := 'https://pezisfaeecgjdguneuip.supabase.co/functions/v1/send-welcome-email';
  END IF;
  
  -- Preparar payload
  payload := jsonb_build_object(
    'email', NEW.email,
    'userId', NEW.id::text,
    'createdAt', NEW.created_at::text
  );
  
  -- Llamar a la Edge Function de forma asíncrona
  -- Nota: Esto requiere la extensión http si está disponible
  -- Si no, puedes usar pg_net o simplemente registrar en una tabla para procesar después
  
  -- Alternativa: Insertar en una tabla de notificaciones pendientes
  -- que puede ser procesada por un cron job o la Edge Function
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla, no bloquear la creación del usuario
    RAISE WARNING 'Error notificando nuevo usuario: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Crear tabla para notificaciones pendientes (alternativa más confiable)
CREATE TABLE IF NOT EXISTS pending_email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email text NOT NULL,
  notification_type text NOT NULL, -- 'welcome' o 'admin_notification'
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_pending_email_notifications_unsent 
ON pending_email_notifications(sent_at) 
WHERE sent_at IS NULL;

-- Trigger que inserta en la tabla de notificaciones
CREATE OR REPLACE FUNCTION queue_email_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar notificación de bienvenida para el usuario
  INSERT INTO pending_email_notifications (user_id, user_email, notification_type)
  VALUES (NEW.id, NEW.email, 'welcome')
  ON CONFLICT DO NOTHING;
  
  -- Insertar notificación para el admin
  INSERT INTO pending_email_notifications (user_id, user_email, notification_type)
  VALUES (NEW.id, NEW.email, 'admin_notification')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_queue_email_notifications ON auth.users;
CREATE TRIGGER trigger_queue_email_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_email_notifications();

-- Habilitar RLS en la tabla
ALTER TABLE pending_email_notifications ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver las notificaciones
CREATE POLICY "Only admins can view email notifications"
  ON pending_email_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

