import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../components/portal/PortalLayout';
import { Downloads } from '../components/portal/Downloads';
import { PremiumApps } from '../components/portal/PremiumApps';
import { Support } from '../components/portal/Support';
import { Profile } from '../components/portal/Profile';
import { useAccessControl } from '../hooks/useAccessControl';
import { Loader2, Lock } from 'lucide-react';

type PageType = 'downloads' | 'apps' | 'support' | 'profile';

function AccessDeniedMessage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Acceso Restringido
        </h2>
        <p className="text-slate-600 mb-6">
          Necesitas una suscripción activa para acceder a esta sección del portal.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          Ver Planes de Suscripción
        </button>
      </div>
    </div>
  );
}

export function Portal() {
  // Cambiar el estado inicial a 'apps' para que los nuevos usuarios vean Apps Premium primero
  const [currentPage, setCurrentPage] = useState<PageType>('apps');
  const [hasInitialRedirect, setHasInitialRedirect] = useState(false);
  const accessLevel = useAccessControl();

  useEffect(() => {
    // Solo hacer redirección automática en la carga inicial, no cuando el usuario navega manualmente
    if (!accessLevel.loading && !hasInitialRedirect) {
      // Por defecto, todos los usuarios nuevos van a Apps Premium
      // Solo si tienen suscripción activa Y acceso a downloads, pueden ir a downloads
      if (accessLevel.canAccessDownloads && accessLevel.hasActiveSubscription) {
        // Usuarios con suscripción activa pueden ir a downloads si quieren
        // Pero por defecto los mantenemos en apps para que vean las apps premium
        setHasInitialRedirect(true);
      } else {
        // Usuarios sin suscripción o sin acceso a downloads: Apps Premium
        setCurrentPage('apps');
        setHasInitialRedirect(true);
      }
    }
  }, [accessLevel.loading, accessLevel.hasAnyProduct, accessLevel.canAccessDownloads, accessLevel.hasActiveSubscription, hasInitialRedirect]);

  const handleNavigate = (page: PageType) => {
    // Todos pueden acceder a apps y a su perfil
    if (page === 'apps' || page === 'profile') {
      setCurrentPage(page);
      return;
    }
    // Para otras páginas, verificar acceso
    if (page === 'downloads' && !accessLevel.canAccessDownloads) {
      return;
    }
    if (page === 'support' && !accessLevel.canAccessSupport) {
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (accessLevel.loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        </div>
      );
    }

    switch (currentPage) {
      case 'downloads':
        return accessLevel.canAccessDownloads ? <Downloads /> : <AccessDeniedMessage />;
      case 'apps':
        return accessLevel.canAccessApps ? <PremiumApps /> : <AccessDeniedMessage />;
      case 'support':
        return accessLevel.canAccessSupport ? <Support /> : <AccessDeniedMessage />;
      case 'profile':
        return <Profile />;
      default:
        return <Downloads />;
    }
  };

  return (
    <PortalLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      accessLevel={accessLevel}
    >
      {renderPage()}
    </PortalLayout>
  );
}