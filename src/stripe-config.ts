export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  currencySymbol: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SRejEG2B99hBCyaNTpL8x3I',
    name: 'Señales VIP Trading Sin Perdidas',
    description: 'Acceso completo a señales VIP de trading con estrategias probadas para maximizar ganancias y minimizar pérdidas.',
    mode: 'subscription',
    price: 20.00,
    currency: 'usd',
    currencySymbol: '$'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}