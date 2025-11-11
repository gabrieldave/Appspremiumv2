/*
  # Remove automatic subscription trigger
  
  The trigger that auto-creates subscription records when a customer is created
  is causing conflicts with the stripe-checkout function which already handles
  subscription record creation properly.
  
  Changes:
  - Drop the trigger and its function
  - Let the stripe-checkout function handle all subscription creation logic
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_create_subscription_record ON stripe_customers;

-- Drop the function
DROP FUNCTION IF EXISTS create_subscription_record_for_customer();
