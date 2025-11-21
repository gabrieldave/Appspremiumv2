/*
  # Permitir que todos los usuarios autenticados puedan VER Apps Premium
  
  Cambio en la política RLS para que todos los usuarios autenticados puedan ver las apps premium
  (para ver la oferta), pero solo los suscriptores pueden descargarlas.
  
  Esto permite que usuarios sin suscripción vean las apps y se animen a suscribirse.
*/

-- Crear nueva política que permite a TODOS los usuarios autenticados ver apps activas
CREATE POLICY "All authenticated users can view active premium apps"
  ON premium_apps FOR SELECT
  TO authenticated
  USING (is_active = true);

-- La política anterior de "Active subscribers can view premium apps" seguirá funcionando
-- pero esta nueva política es más permisiva y permite a todos ver las apps

