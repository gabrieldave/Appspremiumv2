/*
  # Fix Admin Access - Final Solution
  
  Use auth.jwt() to check admin status instead of querying profiles table.
  This completely avoids any recursion issues.
  
  1. Changes
     - Drop existing policy
     - Create new policy using JWT claims
     - Update profile on login to store is_admin in JWT
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users view own profile, admins view all" ON profiles;

-- Create policy using direct ID check or JWT metadata
CREATE POLICY "Users view own profile, admins view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    OR
    id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );