/*
  # Fix RLS Performance and Security Issues

  ## Changes Made

  1. **RLS Performance Optimization**
     - Replace all `auth.uid()` calls with `(SELECT auth.uid())` to prevent re-evaluation per row
     - Improves query performance at scale by evaluating the function once per query
     - Affects all policies in:
       - profiles table (2 policies)
       - downloads table (4 policies)
       - premium_apps table (4 policies)
       - support_links table (4 policies)
       - stripe_customers table (1 policy)
       - stripe_subscriptions table (1 policy)
       - stripe_orders table (1 policy)

  2. **Multiple Permissive Policies Fix**
     - Merge "Users can view own profile" and "Admins can view all profiles" into single policy
     - Eliminates multiple permissive policies for same role/action

  3. **Unused Index Removal**
     - Remove unused indexes that are not being utilized
     - Reduces database maintenance overhead

  4. **Function Search Path Fix**
     - Set immutable search_path on handle_new_user function
     - Prevents security vulnerabilities from mutable search paths

  ## Security Notes
  - All changes maintain existing security model
  - No data access permissions changed
  - Performance optimizations only
*/

-- Drop existing policies to recreate with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Active subscribers can view downloads" ON downloads;
DROP POLICY IF EXISTS "Admins can insert downloads" ON downloads;
DROP POLICY IF EXISTS "Admins can update downloads" ON downloads;
DROP POLICY IF EXISTS "Admins can delete downloads" ON downloads;
DROP POLICY IF EXISTS "Active subscribers can view premium apps" ON premium_apps;
DROP POLICY IF EXISTS "Admins can insert premium apps" ON premium_apps;
DROP POLICY IF EXISTS "Admins can update premium apps" ON premium_apps;
DROP POLICY IF EXISTS "Admins can delete premium apps" ON premium_apps;
DROP POLICY IF EXISTS "Active subscribers can view support links" ON support_links;
DROP POLICY IF EXISTS "Admins can insert support links" ON support_links;
DROP POLICY IF EXISTS "Admins can update support links" ON support_links;
DROP POLICY IF EXISTS "Admins can delete support links" ON support_links;
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

-- Recreate profiles policies with optimized auth.uid() and merged admin/user view policy
CREATE POLICY "Users and admins can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Recreate downloads policies with optimized auth.uid()
CREATE POLICY "Active subscribers can view downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.subscription_status IN ('active', 'trialing')
    )
  );

CREATE POLICY "Admins can insert downloads"
  ON downloads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update downloads"
  ON downloads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete downloads"
  ON downloads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Recreate premium_apps policies with optimized auth.uid()
CREATE POLICY "Active subscribers can view premium apps"
  ON premium_apps FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.subscription_status IN ('active', 'trialing')
    )
  );

CREATE POLICY "Admins can insert premium apps"
  ON premium_apps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update premium apps"
  ON premium_apps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete premium apps"
  ON premium_apps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Recreate support_links policies with optimized auth.uid()
CREATE POLICY "Active subscribers can view support links"
  ON support_links FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.subscription_status IN ('active', 'trialing')
    )
  );

CREATE POLICY "Admins can insert support links"
  ON support_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update support links"
  ON support_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete support links"
  ON support_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Recreate stripe_customers policy with optimized auth.uid()
CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()) AND deleted_at IS NULL);

-- Recreate stripe_subscriptions policy with optimized auth.uid()
CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = (SELECT auth.uid()) AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Recreate stripe_orders policy with optimized auth.uid()
CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = (SELECT auth.uid()) AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Drop unused indexes
DROP INDEX IF EXISTS idx_profiles_subscription_status;
DROP INDEX IF EXISTS idx_downloads_active;
DROP INDEX IF EXISTS idx_premium_apps_active;
DROP INDEX IF EXISTS idx_support_links_active;

-- Fix function search path by recreating with SET search_path
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
