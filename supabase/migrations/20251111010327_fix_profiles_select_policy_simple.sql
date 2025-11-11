/*
  # Fix Profiles SELECT Policy - Simple Solution
  
  Allow users to read their own profile always.
  This avoids all recursion issues.
  
  1. Changes
     - Drop existing policy
     - Create simple policy: users can only read their own profile
     - Admins will read profiles through direct SQL queries in admin routes
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users view own profile, admins view all" ON profiles;

-- Simple policy: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Separate policy for admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );