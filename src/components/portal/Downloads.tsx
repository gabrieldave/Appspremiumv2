import { useEffect, useState } from 'react';
import { Download as DownloadIcon, Calendar, FileText, HardDrive, Loader2, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  is_premium: boolean;
}

interface MT4Download {
  id: string;
  product_id: string;
  version_name: string;
  version_number: string;
  file_url: string;
  file_size: string;
  release_date: string;
  release_notes: string;
  is_active: boolean;
  mt4_products: Product;
}

export function Downloads() {
  const [downloads, setDownloads] = useState<MT4Download[]>([]);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userProductsData } = await supabase
        .from('user_products')
        .select('product_id')
        .eq('user_id', user.id);

      const productIds = userProductsData?.map((up) => up.product_id) || [];
      setUserProducts(productIds);

      const { data, error } = await supabase
        .from('mt4_downloads')
        .select(`
          *,
          mt4_products(*)
        `)
        .eq('is_active', true)
        .order('release_date', { ascending: false });

      if (!error && data) {
        setDownloads(data as any);
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canDownload = (download: MT4Download) => {
    if (!download.mt4_products.is_premium) return true;
    return userProducts.includes(download.product_id);
  };

  const groupedDownloads = downloads.reduce((acc, download) => {
    const productName = download.mt4_products.name;
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push(download);
    return acc;
  }, {} as Record<string, MT4Download[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sistema MT4</h1>
            <p className="text-slate-600">
              Descarga las últimas versiones de nuestro sistema de trading optimizado para MetaTrader 4
            </p>
          </div>
          <a
            href="https://calendly.com/todossomostr4ders/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            <Calendar className="w-5 h-5" />
            Agendar Instalación
          </a>
        </div>
      </div>

      {Object.keys(groupedDownloads).length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <DownloadIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No hay descargas disponibles
          </h3>
          <p className="text-slate-600">
            Las nuevas versiones aparecerán aquí cuando estén disponibles.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDownloads).map(([productName, productDownloads]) => (
            <div key={productName}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{productName}</h2>
                {productDownloads[0].mt4_products.is_premium && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                    PREMIUM
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {productDownloads.map((download) => {
                  const hasAccess = canDownload(download);

                  return (
                    <div
                      key={download.id}
                      className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 ${
                        !hasAccess ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                hasAccess
                                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                  : 'bg-gray-400'
                              }`}
                            >
                              {hasAccess ? (
                                <DownloadIcon className="w-6 h-6 text-white" />
                              ) : (
                                <Lock className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">
                                {download.version_name}
                              </h3>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(download.release_date)}
                                </span>
                                {download.file_size && (
                                  <span className="flex items-center gap-1 text-sm text-slate-500">
                                    <HardDrive className="w-4 h-4" />
                                    {download.file_size}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {download.release_notes && (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <div className="flex items-start gap-2 mb-2">
                                <FileText className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" />
                                <h4 className="font-semibold text-slate-900">Novedades:</h4>
                              </div>
                              <p className="text-slate-700 leading-relaxed whitespace-pre-line ml-6">
                                {download.release_notes}
                              </p>
                            </div>
                          )}

                          {!hasAccess && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <p className="text-sm text-amber-800">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Esta descarga solo está disponible para usuarios con{' '}
                                <strong>{download.mt4_products.name}</strong>. Contacta con el
                                administrador para obtener acceso.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {hasAccess ? (
                            <a
                              href={download.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                              <DownloadIcon className="w-5 h-5" />
                              Descargar
                            </a>
                          ) : (
                            <button
                              disabled
                              className="inline-flex items-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                            >
                              <Lock className="w-5 h-5" />
                              Bloqueado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
