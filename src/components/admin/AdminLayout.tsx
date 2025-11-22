import { ReactNode } from 'react';
import { Download, Grid2x2 as Grid, Headphones, Home, LogOut, Package, Users, Tag, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type AdminLayoutProps = {
  children: ReactNode;
  currentSection: 'mt4' | 'downloads' | 'apps' | 'support' | 'users' | 'promotions' | 'social';
  onNavigate: (section: 'mt4' | 'downloads' | 'apps' | 'support' | 'users' | 'promotions' | 'social') => void;
};

const navigation = [
  { id: 'users' as const, label: 'Gestionar Usuarios', icon: Users },
  { id: 'mt4' as const, label: 'Productos MT4', icon: Package },
  { id: 'downloads' as const, label: 'Gestionar Descargas', icon: Download },
  { id: 'apps' as const, label: 'Gestionar Apps', icon: Grid },
  { id: 'support' as const, label: 'Gestionar Soporte', icon: Headphones },
  { id: 'promotions' as const, label: 'Promociones', icon: Tag },
  { id: 'social' as const, label: 'Redes Sociales', icon: Share2 },
];

export function AdminLayout({ children, currentSection, onNavigate }: AdminLayoutProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg"
                alt="Todos Somos Traders"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <p className="text-xs text-slate-300">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/portal"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Ir al Portal</span>
              </a>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-300 hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2 sticky top-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      currentSection === item.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
