import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface StripePrice {
  id: string;
  price_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currency_symbol: string;
  mode: 'payment' | 'subscription';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useStripePrices() {
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stripe_prices')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPrices(data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching prices:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    const channel = supabase
      .channel('stripe_prices_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stripe_prices' },
        () => {
          fetchPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { prices, loading, error };
}
