import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';

interface SubscriptionCardProps {
  product: StripeProduct;
  isCurrentPlan?: boolean;
}

export function SubscriptionCard({ product, isCurrentPlan = false }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 relative ${
      isCurrentPlan ? 'ring-2 ring-green-500' : ''
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">
            {product.currencySymbol}{product.price}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-600 ml-2">/month</span>
          )}
        </div>
        <p className="text-gray-600">{product.description}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Señales VIP exclusivas</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Análisis técnico avanzado</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Soporte 24/7</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Estrategias probadas</span>
        </div>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </div>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          `Subscribe Now`
        )}
      </button>
    </div>
  );
}