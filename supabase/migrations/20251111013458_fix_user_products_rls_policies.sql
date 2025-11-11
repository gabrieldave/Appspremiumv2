/*
  # Fix RLS Policies for user_products Table
  
  1. Problem
    - Current policies cause infinite recursion when checking admin status
    - This prevents admins from viewing user product assignments
  
  2. Solution
    - Create a stable function to check admin status
    - Replace existing policies with simpler, non-recursive policies
    - Use direct auth.uid() checks to avoid recursion
  
  3. Security
    - Users can only view their own assignments
    - Admins can view and manage all assignments
    - No recursion loops
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their assignments" ON user_products;
DROP POLICY IF EXISTS "Only admins can manage assignments" ON user_products;

-- Create stable function to check admin status (cached within transaction)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$;

-- Policy: Users can view their own assignments OR admins can view all
CREATE POLICY "Users view own assignments, admins view all"
  ON user_products
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin()
  );

-- Policy: Only admins can insert assignments
CREATE POLICY "Admins can create assignments"
  ON user_products
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Policy: Only admins can update assignments
CREATE POLICY "Admins can update assignments"
  ON user_products
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy: Only admins can delete assignments
CREATE POLICY "Admins can delete assignments"
  ON user_products
  FOR DELETE
  TO authenticated
  USING (is_admin());
