/*
  # Actualizar Price ID de Producción
  
  Actualiza el Price ID en la base de datos con el nuevo ID de producción de Stripe.
  NOTA: El campo 'mode' solo acepta 'payment' o 'subscription', no 'live'.
  El Price ID mismo indica si es de test o producción.
*/

-- Actualizar el Price ID existente con el nuevo de producción
UPDATE stripe_prices 
SET 
  price_id = 'price_1SRejEG2B99hBCyaNTpL8x3I',
  updated_at = now()
WHERE is_active = true
OR id = (SELECT id FROM stripe_prices ORDER BY created_at DESC LIMIT 1);

-- Si no hay registros, crear uno nuevo
INSERT INTO stripe_prices (
  price_id,
  name,
  description,
  price,
  currency,
  currency_symbol,
  mode,
  is_active
)
SELECT 
  'price_1SRejEG2B99hBCyaNTpL8x3I',
  'Señales VIP Trading Sin Perdidas',
  'Acceso completo a señales VIP de trading con estrategias probadas para maximizar ganancias y minimizar pérdidas.',
  20.00,
  'usd',
  '$',
  'subscription',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM stripe_prices WHERE price_id = 'price_1SRejEG2B99hBCyaNTpL8x3I'
);

