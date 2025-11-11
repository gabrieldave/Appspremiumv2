/*
  # Fix RLS Profile Read Policy
  
  1. Changes
    - Drop the existing complex SELECT policy that causes 500 errors
    - Create a simpler SELECT policy that allows users to read their own profile
    - This fixes the authentication issue preventing users from accessing the portal
  
  2. Security
    - Users can only read their own profile data
    - Admins are not special-cased in this query to avoid nested subquery issues
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users and admins can view profiles" ON profiles;

-- Create a simple, efficient policy
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
