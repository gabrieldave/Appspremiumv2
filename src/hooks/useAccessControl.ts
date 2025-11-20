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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Admins tienen acceso completo automáticamente
      const isAdmin = profile.is_admin === true;

      if (isAdmin) {
        // Admins tienen acceso total a todo
        setAccessLevel({
          hasActiveSubscription: true,
          hasAlphaStrategy: true,
          hasAlphaLite: true,
          hasAnyProduct: true,
          canAccessDownloads: true,
          canAccessApps: true,
          canAccessSupport: true,
          loading: false,
        });
        return;
      }

      // Lógica para usuarios normales
      const hasActiveSubscription = profile.subscription_status === 'active';

      const { data: userProducts } = await supabase
        .from('user_products')
        .select(`
          mt4_products(code)
        `)
        .eq('user_id', profile.id);

      const hasAlphaStrategy = userProducts?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (up: any) => up.mt4_products?.code === 'alpha_strategy'
      ) || false;

      const hasAlphaLite = userProducts?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (up: any) => up.mt4_products?.code === 'alpha_lite'
      ) || false;

      const hasAnyProduct = (userProducts?.length || 0) > 0;

      // Niveles de acceso según las reglas:
      // 1. Acceso Completo: Usuario con suscripción activa - Acceso a Descargas MT4 (según producto), Apps Premium (descargar) y Soporte
      // 2. Solo Descargas MT4: Usuario con Alpha Strategy sin suscripción - Solo acceso a actualizaciones MT4 de Alpha Strategy
      // 3. Solo Ver Apps: Usuario nuevo sin suscripción - Puede VER Apps Premium (videos/info) pero no descargar
      // 4. Sin Acceso: Usuario sin producto ni suscripción - Puede ver Apps Premium pero no descargar

      setAccessLevel({
        hasActiveSubscription,
        hasAlphaStrategy,
        hasAlphaLite,
        hasAnyProduct,
        // Descargas: Si tiene suscripción activa (con Alpha Lite) O tiene Alpha Strategy (con o sin suscripción)
        canAccessDownloads: hasActiveSubscription || hasAlphaStrategy,
        // Apps Premium: TODOS pueden VER (ver videos/información), pero solo suscriptores pueden DESCARGAR
        // Mostramos el tab a todos, pero el componente verificará si puede descargar
        canAccessApps: true, // Todos pueden VER Apps Premium
        // Soporte: Solo con suscripción activa
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
