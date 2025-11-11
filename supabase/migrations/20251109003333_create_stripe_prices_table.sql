/*
  # Create Stripe Prices Configuration Table

  1. New Tables
    - `stripe_prices`
      - `id` (uuid, primary key)
      - `price_id` (text, unique) - Stripe price ID
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (numeric) - Price amount
      - `currency` (text) - Currency code (e.g., 'usd')
      - `currency_symbol` (text) - Currency symbol (e.g., '$')
      - `mode` (text) - Payment mode ('payment' or 'subscription')
      - `is_active` (boolean) - Whether this price is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `stripe_prices` table
    - Add policy for public read access (anyone can see prices)
    - Add policy for admin-only write access
    
  3. Data
    - Insert current VIP subscription price
*/

-- Create stripe_prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  currency_symbol text NOT NULL DEFAULT '$',
  mode text NOT NULL CHECK (mode IN ('payment', 'subscription')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active prices (public access for pricing page)
CREATE POLICY "Anyone can read active prices"
  ON stripe_prices
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert prices
CREATE POLICY "Admins can insert prices"
  ON stripe_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can update prices
CREATE POLICY "Admins can update prices"
  ON stripe_prices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete prices
CREATE POLICY "Admins can delete prices"
  ON stripe_prices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert current VIP subscription price
INSERT INTO stripe_prices (
  price_id,
  name,
  description,
  price,
  currency,
  currency_symbol,
  mode,
  is_active
) VALUES (
  'price_1SRFznG2B99hBCya4vFOfnbY',
  'Señales VIP Trading Sin Perdidas',
  'Acceso completo a señales VIP de trading con estrategias probadas para maximizar ganancias y minimizar pérdidas.',
  15.00,
  'usd',
  '$',
  'subscription',
  true
) ON CONFLICT (price_id) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_stripe_prices_updated_at ON stripe_prices;
CREATE TRIGGER update_stripe_prices_updated_at
  BEFORE UPDATE ON stripe_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();