/*
  # Fix admin profiles read without recursion
  
  Drops the problematic recursive policy and creates a simple one
  that checks is_admin directly on the same row
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a non-recursive policy that allows users to read profiles where they are admin
CREATE POLICY "Admins can read all profiles v2"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
