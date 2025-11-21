import { ReactNode, useState } from 'react';
import { Download, Grid, Headphones, User, LogOut, Menu, X, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { AccessLevel } from '../../hooks/useAccessControl';

type PortalLayoutProps = {
  children: ReactNode;
  currentPage: 'downloads' | 'apps' | 'support' | 'profile';
  onNavigate: (page: 'downloads' | 'apps' | 'support' | 'profile') => void;
  accessLevel: AccessLevel;
};

const navigation = [
  { id: 'downloads' as const, label: 'Descargas MT4', icon: Download, requiresAccess: 'canAccessDownloads' as const },
  { id: 'apps' as const, label: 'Apps Premium', icon: Grid, requiresAccess: 'canAccessApps' as const },
  { id: 'support' as const, label: 'Soporte VIP', icon: Headphones, requiresAccess: 'canAccessSupport' as const },
  { id: 'profile' as const, label: 'Mi Perfil', icon: User, requiresAccess: null },
];

export function PortalLayout({ children, currentPage, onNavigate, accessLevel }: PortalLayoutProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const canAccessItem = (item: typeof navigation[0]) => {
    if (!item.requiresAccess) return true;
    return accessLevel[item.requiresAccess];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg"
                alt="Todos Somos Traders"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Todos Somos Traders</h1>
                <p className="text-xs text-slate-500">Portal Premium</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                // Apps Premium y Perfil: Todos pueden acceder
                // Perfil: Todos los usuarios autenticados pueden acceder
                const hasAccess = item.id === 'apps' || item.id === 'profile' ? true : canAccessItem(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => hasAccess && onNavigate(item.id)}
                    disabled={!hasAccess}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : hasAccess
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {!hasAccess && <Lock className="w-3 h-3" />}
                  </button>
                );
              })}
              {profile?.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors ml-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                // Apps Premium y Perfil: Todos pueden acceder
                const hasAccess = item.id === 'apps' || item.id === 'profile' ? true : canAccessItem(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (hasAccess) {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    disabled={!hasAccess}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                        : hasAccess
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {!hasAccess && <Lock className="w-3 h-3" />}
                  </button>
                );
              })}
              {profile?.is_admin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
