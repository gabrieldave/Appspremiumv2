import React from 'react';
import { stripeProducts } from '../stripe-config';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';

export function PricingPage() {
  const { subscription } = useSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Trading Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get access to premium trading signals and maximize your profits
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