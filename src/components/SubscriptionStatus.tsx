import React from 'react';
import { Crown, AlertCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';

export function SubscriptionStatus() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">No Active Subscription</h3>
            <p className="text-sm text-yellow-700">Subscribe to access premium features</p>
          </div>
        </div>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing';

  return (
    <div className={`rounded-lg p-4 ${
      isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center">
        <Crown className={`w-5 h-5 mr-3 ${
          isActive ? 'text-green-600' : 'text-red-600'
        }`} />
        <div>
          <h3 className={`text-sm font-medium ${
            isActive ? 'text-green-800' : 'text-red-800'
          }`}>
            {product?.name || 'Subscription'}
          </h3>
          <p className={`text-sm ${
            isActive ? 'text-green-700' : 'text-red-700'
          }`}>
            Status: {subscription.subscription_status.replace('_', ' ').toUpperCase()}
          </p>
          {subscription.current_period_end && (
            <p className={`text-xs ${
              isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {subscription.cancel_at_period_end ? 'Cancels' : 'Renews'} on{' '}
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}