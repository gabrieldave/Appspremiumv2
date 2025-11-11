/*
  # Fix Admin Access - Simple Solution
  
  Remove the recursive policy and create a simple one that works.
  Users can always read their own profile (including is_admin field).
*/

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Single policy: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
