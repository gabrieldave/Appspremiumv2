/*
  # Fix subscription creation trigger
  
  Fixes the trigger that auto-creates subscription records when a new Stripe customer is created.
  The trigger was referencing the wrong column name.
  
  Changes:
  - Drop and recreate the trigger function with correct column reference
  - The function now correctly uses NEW.customer_id instead of NEW.customer
*/

-- Drop and recreate the function with the correct field reference
DROP FUNCTION IF EXISTS create_subscription_record_for_customer() CASCADE;

CREATE OR REPLACE FUNCTION create_subscription_record_for_customer()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert a subscription record with not_started status
  INSERT INTO stripe_subscriptions (customer_id, status)
  VALUES (NEW.customer_id, 'not_started')
  ON CONFLICT (customer_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_create_subscription_record
  AFTER INSERT ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_record_for_customer();
