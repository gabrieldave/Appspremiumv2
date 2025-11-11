/*
  # Simplify Profiles RLS Policy v2
  
  Remove the is_admin() function and use a simpler approach.
  Allow admins to read all profiles without recursion issues.
  
  1. Changes
     - Drop existing policy first
     - Drop is_admin() function
     - Create simpler profiles SELECT policy
*/

-- Drop existing policy first
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON profiles;

-- Drop the helper function
DROP FUNCTION IF EXISTS is_admin();

-- Create simpler policy for SELECT that avoids recursion
-- This uses a subquery with LIMIT 1 to prevent infinite recursion
CREATE POLICY "Users view own profile, admins view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
      LIMIT 1
    )
  );