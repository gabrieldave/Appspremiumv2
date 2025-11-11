/*
  # Allow admins to read all profiles with security definer function
  
  Creates a function in public schema to check admin status without recursion
*/

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all user products" ON user_products;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Recreate policies using the function
CREATE POLICY "Admins can view all user products"
  ON user_products FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin() = true);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin() = true);
