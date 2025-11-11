/*
  # Sync Profiles from Stripe Subscriptions

  1. Changes
    - Create function to automatically sync profile subscription status from stripe_subscriptions
    - Create trigger to run on INSERT/UPDATE of stripe_subscriptions
    - Backfill existing subscriptions to profiles

  2. Logic
    - When stripe_subscriptions is updated, automatically update the corresponding profile
    - Map Stripe status to profile subscription_status
    - Set subscription_end_date from current_period_end
    
  3. Status Mapping
    - active -> active
    - trialing -> trialing
    - past_due -> past_due
    - canceled -> canceled
    - unpaid -> inactive
    - incomplete -> inactive
    - incomplete_expired -> inactive
    - paused -> inactive
    - not_started -> inactive
*/

-- Function to sync profile from stripe subscription
CREATE OR REPLACE FUNCTION sync_profile_from_stripe_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_subscription_status text;
  v_subscription_end_date timestamptz;
BEGIN
  -- Get user_id from stripe_customers table
  SELECT user_id INTO v_user_id
  FROM stripe_customers
  WHERE customer_id = NEW.customer_id
  AND deleted_at IS NULL;

  -- If no user found, skip update
  IF v_user_id IS NULL THEN
    RAISE WARNING 'No user found for customer_id: %', NEW.customer_id;
    RETURN NEW;
  END IF;

  -- Map Stripe status to our subscription_status
  CASE NEW.status
    WHEN 'active' THEN
      v_subscription_status := 'active';
    WHEN 'trialing' THEN
      v_subscription_status := 'trialing';
    WHEN 'past_due' THEN
      v_subscription_status := 'past_due';
    WHEN 'canceled' THEN
      v_subscription_status := 'canceled';
    ELSE
      v_subscription_status := 'inactive';
  END CASE;

  -- Set subscription end date
  IF NEW.current_period_end IS NOT NULL THEN
    v_subscription_end_date := to_timestamp(NEW.current_period_end);
  ELSE
    v_subscription_end_date := NULL;
  END IF;

  -- Update profile
  UPDATE profiles
  SET 
    subscription_status = v_subscription_status,
    subscription_end_date = v_subscription_end_date,
    updated_at = now()
  WHERE id = v_user_id;

  RAISE LOG 'Updated profile % with status % and end_date %', v_user_id, v_subscription_status, v_subscription_end_date;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS sync_profile_on_stripe_subscription_change ON stripe_subscriptions;

-- Create trigger
CREATE TRIGGER sync_profile_on_stripe_subscription_change
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_stripe_subscription();

-- Backfill: Update all existing profiles based on current stripe_subscriptions
DO $$
DECLARE
  v_record RECORD;
  v_subscription_status text;
  v_subscription_end_date timestamptz;
BEGIN
  FOR v_record IN 
    SELECT 
      sc.user_id,
      ss.status,
      ss.current_period_end
    FROM stripe_subscriptions ss
    JOIN stripe_customers sc ON ss.customer_id = sc.customer_id
    WHERE sc.deleted_at IS NULL
  LOOP
    -- Map status
    CASE v_record.status
      WHEN 'active' THEN
        v_subscription_status := 'active';
      WHEN 'trialing' THEN
        v_subscription_status := 'trialing';
      WHEN 'past_due' THEN
        v_subscription_status := 'past_due';
      WHEN 'canceled' THEN
        v_subscription_status := 'canceled';
      ELSE
        v_subscription_status := 'inactive';
    END CASE;

    -- Set end date
    IF v_record.current_period_end IS NOT NULL THEN
      v_subscription_end_date := to_timestamp(v_record.current_period_end);
    ELSE
      v_subscription_end_date := NULL;
    END IF;

    -- Update profile
    UPDATE profiles
    SET 
      subscription_status = v_subscription_status,
      subscription_end_date = v_subscription_end_date,
      updated_at = now()
    WHERE id = v_record.user_id;

    RAISE LOG 'Backfilled profile % with status %', v_record.user_id, v_subscription_status;
  END LOOP;
END $$;