import React from 'react';
import { stripeProducts } from '../stripe-config';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';

export function PricingPage() {
  const { subscription } = useSubscription();

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
          {stripeProducts.map((product) => (
            <SubscriptionCard
              key={product.priceId}
              product={product}
              isCurrentPlan={subscription?.price_id === product.priceId && subscription?.subscription_status === 'active'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}