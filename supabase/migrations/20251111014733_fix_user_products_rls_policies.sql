/*
  # Fix RLS for user_products to allow admin access
  
  Instead of trying to fix profiles recursion, let's allow admins
  to access user_products directly
*/

-- Drop existing SELECT policy on user_products if it exists
DROP POLICY IF EXISTS "Users can view own products" ON user_products;
DROP POLICY IF EXISTS "Admins can view all user products" ON user_products;

-- Users can view their own products
CREATE POLICY "Users can view own products"
  ON user_products FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all user products (check profiles table)
CREATE POLICY "Admins can view all user products"
  ON user_products FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
