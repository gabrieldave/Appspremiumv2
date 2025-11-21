import { useEffect, useState } from 'react';
import { Grid, Loader2, ArrowLeft, Lock, Download } from 'lucide-react';
import { supabase, PremiumApp } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function PremiumApps() {
  const [apps, setApps] = useState<PremiumApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<PremiumApp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('premium_apps')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching apps:', error);
        setApps([]);
      } else {
        setApps(data || []);
      }
    } catch (error) {
      console.error('Exception fetching apps:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (selectedApp) {
    return <AppDetail app={selectedApp} onBack={() => setSelectedApp(null)} />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Apps Premium</h1>
        <p className="text-slate-600">
          Colección exclusiva de herramientas profesionales para potenciar tu trading
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Grid className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No hay apps disponibles
          </h3>
          <p className="text-slate-600">
            Las nuevas aplicaciones aparecerán aquí cuando estén disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-slate-200"
            >
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                {app.image_url ? (
                  <img
                    src={app.image_url}
                    alt={app.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Grid className="w-16 h-16 text-slate-600" />
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                  {app.title}
                </h3>
                <p className="text-slate-600 line-clamp-3 leading-relaxed">
                  {app.description}
                </p>
                {app.category && (
                  <div className="mt-4">
                    <span className="inline-block bg-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {app.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AppDetailProps = {
  app: PremiumApp;
  onBack: () => void;
};

function AppDetail({ app, onBack }: AppDetailProps) {
  const { profile } = useAuth();
  
  // Todos pueden VER Apps Premium, pero solo suscriptores pueden DESCARGAR
  const canDownload = profile?.subscription_status === 'active' || profile?.is_admin === true;
  
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = app.video_url ? getYouTubeEmbedUrl(app.video_url) : null;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Apps
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {embedUrl ? (
          <div className="aspect-video bg-slate-900">
            <iframe
              src={embedUrl}
              title={app.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : app.image_url ? (
          <div className="aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
            <img
              src={app.image_url}
              alt={app.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Grid className="w-24 h-24 text-slate-600" />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{app.title}</h1>
              {app.category && (
                <span className="inline-block bg-cyan-100 text-cyan-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {app.category}
                </span>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Descripción</h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {app.description}
            </p>
          </div>

          {canDownload ? (
            <a
              href={app.download_url}
              download
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <Download className="w-5 h-5" />
              Descargar Aplicación
            </a>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">Descarga Requiere Suscripción</h4>
                    <p className="text-sm text-amber-800 mb-4">
                      Necesitas una suscripción activa para descargar esta aplicación. Puedes ver toda la información y videos, pero la descarga está disponible solo para suscriptores VIP.
                    </p>
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Ver Planes de Suscripción
                    </a>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="inline-flex items-center gap-2 bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                Descarga Bloqueada
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
