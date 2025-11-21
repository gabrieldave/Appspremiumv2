/*
  # Allow Admins to View All Premium Apps

  1. Changes
    - Add policy to allow admins to view all premium apps (active and inactive)
    - This is needed for the admin panel to load and manage apps

  2. Security
    - Only admins can view inactive apps
    - Regular users can only view active apps (existing policy)
*/

-- Allow admins to view all premium apps (active and inactive)
CREATE POLICY "Admins can view all premium apps"
  ON premium_apps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

