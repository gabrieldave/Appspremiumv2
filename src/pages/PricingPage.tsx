import React from 'react';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';
import { useStripePrices } from '../hooks/useStripePrices';
import { Loader2 } from 'lucide-react';

export function PricingPage() {
  const { subscription } = useSubscription();
  const { prices, loading } = useStripePrices();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Elige Tu Plan de Trading
          </h1>
          <p className="text-xl text-slate-300">
            Accede a señales premium de trading y maximiza tus ganancias
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 max-w-md mx-auto">
          {prices.map((price) => (
            <SubscriptionCard
              key={price.price_id}
              product={{
                priceId: price.price_id,
                name: price.name,
                description: price.description,
                mode: price.mode,
                price: price.price,
                currency: price.currency,
                currencySymbol: price.currency_symbol,
              }}
              isCurrentPlan={subscription?.price_id === price.price_id && subscription?.subscription_status === 'active'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}