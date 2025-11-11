/*
  # Fix sync_profile_from_stripe_subscription function

  The function was referencing NEW.customer and NEW.id, but the correct 
  column names are NEW.customer_id and NEW.subscription_id
*/

CREATE OR REPLACE FUNCTION sync_profile_from_stripe_subscription()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user_id from stripe_customers table
  SELECT user_id INTO v_user_id
  FROM stripe_customers
  WHERE customer_id = NEW.customer_id;

  -- Only update if we found a matching user
  IF v_user_id IS NOT NULL THEN
    UPDATE profiles
    SET 
      stripe_customer_id = NEW.customer_id,
      stripe_subscription_id = NEW.subscription_id,
      subscription_status = CASE
        WHEN NEW.status IN ('active', 'trialing') THEN 'active'
        WHEN NEW.status = 'canceled' THEN 'canceled'
        WHEN NEW.status = 'past_due' THEN 'past_due'
        ELSE 'inactive'
      END,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;
