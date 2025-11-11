/*
  # Fix Profiles RLS for Admin Access
  
  Admins need to be able to view all user profiles to assign products.
  
  1. Changes
     - Drop existing "Users can view own profile" policy
     - Create new policy that allows users to view their own profile OR admins to view all profiles
  
  2. Security
     - Regular users can only see their own profile
     - Admins can see all profiles (needed for user management)
*/

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policy that allows users to see their own profile OR admins to see all
CREATE POLICY "Users can view own profile or admins can view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
      AND is_admin = true
    )
  );