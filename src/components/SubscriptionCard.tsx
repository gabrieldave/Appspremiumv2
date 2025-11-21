import React, { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';

interface SubscriptionCardProps {
  product: StripeProduct;
  isCurrentPlan?: boolean;
}

export function SubscriptionCard({ product, isCurrentPlan = false }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la suscripción. Intenta de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-slate-800 rounded-xl shadow-2xl p-8 relative border border-slate-700 ${
      isCurrentPlan ? 'ring-2 ring-cyan-500' : ''
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
            Plan Actual
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">{product.name}</h3>
        <div className="mb-4">
          <span className="text-5xl font-bold text-white">
            {product.currencySymbol}{product.price}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-slate-400 ml-2 text-lg">/mes</span>
          )}
        </div>
        <p className="text-slate-300">{product.description}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" />
          <span className="text-slate-200">Señales VIP exclusivas</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" />
          <span className="text-slate-200">Análisis técnico avanzado</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" />
          <span className="text-slate-200">Soporte 24/7</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" />
          <span className="text-slate-200">Estrategias probadas</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
          isCurrentPlan
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:scale-105'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Procesando...
          </div>
        ) : isCurrentPlan ? (
          'Plan Actual'
        ) : (
          'Suscribirse Ahora'
        )}
      </button>
    </div>
  );
}
}