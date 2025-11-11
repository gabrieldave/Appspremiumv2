/*
  # Auto-create subscription record for new Stripe customers

  Creates a trigger that automatically creates a subscription record 
  whenever a new customer is added to stripe_customers table.
  
  This ensures that all users (whether created through signup or admin panel)
  will have a subscription record ready when they try to subscribe.
*/

-- Create function to auto-create subscription record
CREATE OR REPLACE FUNCTION create_subscription_record_for_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a subscription record with not_started status
  INSERT INTO stripe_subscriptions (customer_id, status)
  VALUES (NEW.customer_id, 'not_started')
  ON CONFLICT (customer_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on stripe_customers table
DROP TRIGGER IF EXISTS trigger_create_subscription_record ON stripe_customers;

CREATE TRIGGER trigger_create_subscription_record
  AFTER INSERT ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_record_for_customer();
