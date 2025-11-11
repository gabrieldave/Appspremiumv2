import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface AccessLevel {
  hasActiveSubscription: boolean;
  hasAlphaStrategy: boolean;
  hasAlphaLite: boolean;
  hasAnyProduct: boolean;
  canAccessDownloads: boolean;
  canAccessApps: boolean;
  canAccessSupport: boolean;
  loading: boolean;
}

export function useAccessControl(): AccessLevel {
  const { profile } = useAuth();
  const [accessLevel, setAccessLevel] = useState<AccessLevel>({
    hasActiveSubscription: false,
    hasAlphaStrategy: false,
    hasAlphaLite: false,
    hasAnyProduct: false,
    canAccessDownloads: false,
    canAccessApps: false,
    canAccessSupport: false,
    loading: true,
  });

  useEffect(() => {
    checkAccess();
  }, [profile]);

  async function checkAccess() {
    if (!profile) {
      setAccessLevel({
        hasActiveSubscription: false,
        hasAlphaStrategy: false,
        hasAlphaLite: false,
        hasAnyProduct: false,
        canAccessDownloads: false,
        canAccessApps: false,
        canAccessSupport: false,
        loading: false,
      });
      return;
    }

    try {
      const hasActiveSubscription = profile.subscription_status === 'active';

      const { data: userProducts } = await supabase
        .from('user_products')
        .select(`
          mt4_products(code)
        `)
        .eq('user_id', profile.id);

      const hasAlphaStrategy = userProducts?.some(
        (up: any) => up.mt4_products?.code === 'alpha_strategy'
      ) || false;

      const hasAlphaLite = userProducts?.some(
        (up: any) => up.mt4_products?.code === 'alpha_lite'
      ) || false;

      const hasAnyProduct = (userProducts?.length || 0) > 0;

      setAccessLevel({
        hasActiveSubscription,
        hasAlphaStrategy,
        hasAlphaLite,
        hasAnyProduct,
        canAccessDownloads: hasAnyProduct,
        canAccessApps: hasActiveSubscription,
        canAccessSupport: hasActiveSubscription,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking access:', error);
      setAccessLevel({
        hasActiveSubscription: false,
        hasAlphaStrategy: false,
        hasAlphaLite: false,
        hasAnyProduct: false,
        canAccessDownloads: false,
        canAccessApps: false,
        canAccessSupport: false,
        loading: false,
      });
    }
  }

  return accessLevel;
}
