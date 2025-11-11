/*
  # Allow admins to read all profiles
  
  Adds SELECT policy for admins to view all user profiles
*/

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );
