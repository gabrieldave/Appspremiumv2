/*
  # Fix Profiles RLS Recursion Issue
  
  The current policy for profiles has a recursive check that can cause performance issues.
  We'll create a helper function to check admin status without causing recursion.
  
  1. Changes
     - Create a security definer function to check if user is admin
     - Update profiles policy to use this function
     - This prevents recursive policy checks
*/

-- Create a function to check if the current user is an admin
-- This is SECURITY DEFINER so it bypasses RLS when checking
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON profiles;

-- Recreate with the helper function to avoid recursion
CREATE POLICY "Users can view own profile or admins can view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR
    is_admin()
  );