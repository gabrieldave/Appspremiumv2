import { useEffect, useState } from 'react';
import { Download as DownloadIcon, Calendar, FileText, HardDrive, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { supabase, MT4DownloadLink } from '../../lib/supabase';

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
  download_limit: number;
  mt4_products: Product;
  mt4_download_links?: MT4DownloadLink[];
}

interface DownloadWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DownloadWarningModal({ isOpen, onConfirm, onCancel }: DownloadWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Advertencia Importante</h3>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="space-y-3">
            <p className="text-slate-700 leading-relaxed">
              <strong className="text-red-600">IMPORTANTE:</strong> Este software solo puede ser instalado en un máximo de <strong>3 computadoras</strong>.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Si instalas este software en más de 3 computadoras, tu cuenta será <strong className="text-red-600">baneada permanentemente</strong> sin posibilidad de recuperación.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Requisitos de Monitor</h4>
            <p className="text-blue-800 text-sm leading-relaxed mb-2">
              <strong>Compatibilidad de Resolución:</strong> Este software solo es compatible con las siguientes resoluciones de monitor:
            </p>
            <ul className="list-disc list-inside text-blue-800 text-sm space-y-1 mb-2">
              <li><strong>2560 x 1440</strong> (QHD / 2K)</li>
              <li><strong>3440 x 1440</strong> (Ultrawide QHD)</li>
            </ul>
            <p className="text-blue-800 text-sm leading-relaxed">
              <strong>Es necesario contar con un monitor de una de estas resoluciones</strong> para que el software funcione correctamente.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-amber-900 mb-2">¿Necesitas Ayuda con la Instalación?</h4>
            <p className="text-amber-800 text-sm leading-relaxed">
              Si necesitas soporte para la instalación, puedes agendar una sesión usando el botón <strong>"Agendar Instalación"</strong> ubicado en la parte superior de esta página.
            </p>
          </div>

          <p className="text-slate-700 leading-relaxed text-sm pt-2 border-t border-slate-200">
            Al hacer clic en "Aceptar y Descargar", confirmas que has leído y entendido todas estas advertencias y requisitos.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
          >
            Aceptar y Descargar
          </button>
        </div>
      </div>
    </div>
  );
}

export function Downloads() {
  const [downloads, setDownloads] = useState<MT4Download[]>([]);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    downloadId: string | null;
    linkId: string | null;
    fileUrl: string;
    label: string | null;
  }>({
    isOpen: false,
    downloadId: null,
    linkId: null,
    fileUrl: '',
    label: null,
  });
  const [userDownloadCounts, setUserDownloadCounts] = useState<Record<string, number>>({});

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

      // Obtener productos del usuario con sus códigos
      const { data: userProductsData } = await supabase
        .from('user_products')
        .select(`
          product_id,
          mt4_products(code, name, is_premium)
        `)
        .eq('user_id', user.id);

      const productIds = userProductsData?.map((up) => up.product_id) || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userProductCodes = userProductsData?.map((up: any) => up.mt4_products?.code).filter(Boolean) || [];
      setUserProducts(productIds);

      // Verificar si el usuario es admin para ver todas las descargas
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const isAdmin = profileData?.is_admin === true;

      // Obtener todas las descargas activas con sus enlaces
      const { data: allDownloads, error } = await supabase
        .from('mt4_downloads')
        .select(`
          *,
          mt4_products(*),
          mt4_download_links(*)
        `)
        .eq('is_active', true)
        .order('release_date', { ascending: false });

      // Obtener conteo de descargas del usuario
      const { data: userDownloadsData } = await supabase
        .from('user_downloads')
        .select('download_id')
        .eq('user_id', user.id);

      const downloadCounts: Record<string, number> = {};
      userDownloadsData?.forEach((ud) => {
        downloadCounts[ud.download_id] = (downloadCounts[ud.download_id] || 0) + 1;
      });
      setUserDownloadCounts(downloadCounts);

      // Filtrar descargas según los productos del usuario
      // Si es admin, ve todas. Si no, solo ve descargas de productos que tiene
      let filteredDownloads = allDownloads || [];
      
      if (!isAdmin && allDownloads) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredDownloads = allDownloads.filter((download: any) => {
          const productCode = download.mt4_products?.code;
          // Solo mostrar descargas de productos que el usuario tiene asignados
          return userProductCodes.includes(productCode);
        });
      }

      if (!error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDownloads(filteredDownloads as any);
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

  const hasReachedLimit = (download: MT4Download) => {
    const downloadCount = userDownloadCounts[download.id] || 0;
    const limit = download.download_limit || 1;
    return downloadCount >= limit;
  };

  const handleDownloadClick = (download: MT4Download, linkId: string | null, fileUrl: string, label: string | null) => {
    if (hasReachedLimit(download)) {
      alert(`Has alcanzado el límite de descargas para esta versión. Solo puedes descargarla ${download.download_limit} vez(es).`);
      return;
    }

    setWarningModal({
      isOpen: true,
      downloadId: download.id,
      linkId,
      fileUrl,
      label,
    });
  };

  const handleConfirmDownload = async () => {
    if (!warningModal.downloadId || !warningModal.fileUrl) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar la descarga para obtener el límite
      const download = downloads.find((d) => d.id === warningModal.downloadId);
      if (!download) return;

      // Verificar límite antes de insertar
      const currentCount = userDownloadCounts[warningModal.downloadId] || 0;
      const limit = download.download_limit || 1;

      if (currentCount >= limit) {
        alert('Has alcanzado el límite de descargas para esta versión. Se te han terminado las licencias.');
        setWarningModal({
          isOpen: false,
          downloadId: null,
          linkId: null,
          fileUrl: '',
          label: null,
        });
        return;
      }

      // Registrar la descarga
      const { error: insertError } = await supabase
        .from('user_downloads')
        .insert({
          user_id: user.id,
          download_id: warningModal.downloadId,
          download_link_id: warningModal.linkId,
        });

      if (insertError) {
        // Si el error es por duplicado (unique constraint)
        if (insertError.code === '23505') {
          alert('Ya has descargado esta versión anteriormente. Se te han terminado las licencias.');
        } else {
          console.error('Error registering download:', insertError);
          alert('Error al registrar la descarga. Por favor, intenta de nuevo.');
        }
      } else {
        // Actualizar conteo local
        setUserDownloadCounts((prev) => ({
          ...prev,
          [warningModal.downloadId!]: (prev[warningModal.downloadId!] || 0) + 1,
        }));

        // Abrir enlace de descarga
        window.open(warningModal.fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error handling download:', error);
      alert('Error al procesar la descarga. Por favor, intenta de nuevo.');
    } finally {
      setWarningModal({
        isOpen: false,
        downloadId: null,
        linkId: null,
        fileUrl: '',
        label: null,
      });
    }
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
                            <div className="space-y-2">
                              {hasReachedLimit(download) ? (
                                <div className="text-center">
                                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold">
                                    <Lock className="w-5 h-5" />
                                    Límite Alcanzado
                                  </div>
                                  <p className="text-xs text-red-600 mt-2">
                                    Se te han terminado las licencias para esta versión
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {download.mt4_download_links && download.mt4_download_links.length > 0 ? (
                                    <div className="space-y-2">
                                      {download.mt4_download_links
                                        .sort((a, b) => a.display_order - b.display_order)
                                        .map((link) => (
                                          <button
                                            key={link.id}
                                            onClick={() => handleDownloadClick(download, link.id, link.file_url, link.label)}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                          >
                                            <DownloadIcon className="w-5 h-5" />
                                            {link.label || 'Descargar'}
                                          </button>
                                        ))}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleDownloadClick(download, null, download.file_url, null)}
                                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                      <DownloadIcon className="w-5 h-5" />
                                      Descargar
                                    </button>
                                  )}
                                  {userDownloadCounts[download.id] > 0 && (
                                    <p className="text-xs text-slate-500 text-center">
                                      Descargas: {userDownloadCounts[download.id]}/{download.download_limit || 1}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
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

      <DownloadWarningModal
        isOpen={warningModal.isOpen}
        onConfirm={handleConfirmDownload}
        onCancel={() => setWarningModal({
          isOpen: false,
          downloadId: null,
          linkId: null,
          fileUrl: '',
          label: null,
        })}
      />
    </div>
  );
}
