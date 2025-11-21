import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Trash, RotateCcw, Users } from 'lucide-react';
import { supabase, MT4Download, MT4Product, MT4DownloadLink } from '../../lib/supabase';

type DownloadLinkForm = {
  file_url: string;
  label: string;
};

type FormData = {
  product_id: string;
  version_name: string;
  version_number: string;
  file_url: string;
  file_size: string;
  release_date: string;
  release_notes: string;
  is_active: boolean;
  download_limit: number;
  download_links: DownloadLinkForm[];
};

export function DownloadsManager() {
  const [downloads, setDownloads] = useState<MT4Download[]>([]);
  const [products, setProducts] = useState<MT4Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [downloadStats, setDownloadStats] = useState<Record<string, { count: number; users: Array<{ user_id: string; email: string; downloaded_at: string }> }>>({});
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<FormData>({
    product_id: '',
    version_name: '',
    version_number: '',
    file_url: '',
    file_size: '',
    release_date: new Date().toISOString().split('T')[0],
    release_notes: '',
    is_active: true,
    download_limit: 1,
    download_links: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: productsData } = await supabase
      .from('mt4_products')
      .select('*')
      .order('name');

    const { data: downloadsData } = await supabase
      .from('mt4_downloads')
      .select(`
        *,
        mt4_products(*),
        mt4_download_links(*)
      `)
      .order('release_date', { ascending: false });

    if (productsData) setProducts(productsData);
    if (downloadsData) setDownloads(downloadsData as MT4Download[]);

    // Obtener estadísticas de descargas para cada versión
    if (downloadsData) {
      const stats: Record<string, { count: number; users: Array<{ user_id: string; email: string; downloaded_at: string }> }> = {};
      
      for (const download of downloadsData) {
        const { data: userDownloads } = await supabase
          .from('user_downloads')
          .select(`
            user_id,
            downloaded_at,
            profiles(email)
          `)
          .eq('download_id', download.id);

        if (userDownloads) {
          stats[download.id] = {
            count: userDownloads.length,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            users: userDownloads.map((ud: any) => ({
              user_id: ud.user_id,
              email: (ud.profiles && !Array.isArray(ud.profiles) ? ud.profiles.email : Array.isArray(ud.profiles) && ud.profiles[0]?.email) || 'N/A',
              downloaded_at: ud.downloaded_at,
            })),
          };
        }
      }
      
      setDownloadStats(stats);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const downloadData = {
        product_id: formData.product_id,
        version_name: formData.version_name,
        version_number: formData.version_number,
        file_url: formData.file_url, // Mantener para compatibilidad
        file_size: formData.file_size,
        release_date: formData.release_date,
        release_notes: formData.release_notes,
        is_active: formData.is_active,
        download_limit: formData.download_limit,
      };

      if (editingId) {
        // Actualizar descarga
        const { error: downloadError } = await supabase
          .from('mt4_downloads')
          .update(downloadData)
          .eq('id', editingId);

        if (downloadError) throw downloadError;

        // Eliminar enlaces existentes
        await supabase
          .from('mt4_download_links')
          .delete()
          .eq('download_id', editingId);

        // Insertar nuevos enlaces
        if (formData.download_links.length > 0) {
          const linksToInsert = formData.download_links.map((link, index) => ({
            download_id: editingId,
            file_url: link.file_url,
            label: link.label || null,
            display_order: index,
          }));

          const { error: linksError } = await supabase
            .from('mt4_download_links')
            .insert(linksToInsert);

          if (linksError) throw linksError;
        }

        await fetchData();
        resetForm();
      } else {
        // Crear nueva descarga
        const { data: newDownload, error: downloadError } = await supabase
          .from('mt4_downloads')
          .insert([downloadData])
          .select()
          .single();

        if (downloadError) throw downloadError;

        // Insertar enlaces de descarga
        if (formData.download_links.length > 0 && newDownload) {
          const linksToInsert = formData.download_links.map((link, index) => ({
            download_id: newDownload.id,
            file_url: link.file_url,
            label: link.label || null,
            display_order: index,
          }));

          const { error: linksError } = await supabase
            .from('mt4_download_links')
            .insert(linksToInsert);

          if (linksError) throw linksError;
        }

        await fetchData();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving download:', error);
      alert('Error al guardar la descarga. Por favor, intenta de nuevo.');
    }
  };

  const handleEdit = (download: MT4Download & { mt4_download_links?: MT4DownloadLink[] }) => {
    setEditingId(download.id);
    
    // Convertir enlaces a formato del formulario
    const downloadLinks: DownloadLinkForm[] = 
      download.mt4_download_links && download.mt4_download_links.length > 0
        ? download.mt4_download_links
            .sort((a, b) => a.display_order - b.display_order)
            .map(link => ({
              file_url: link.file_url,
              label: link.label || '',
            }))
        : [];

    setFormData({
      product_id: download.product_id,
      version_name: download.version_name,
      version_number: download.version_number,
      file_url: download.file_url,
      file_size: download.file_size || '',
      release_date: download.release_date.split('T')[0],
      release_notes: download.release_notes,
      is_active: download.is_active,
      download_limit: download.download_limit ?? 1,
      download_links: downloadLinks.length > 0 ? downloadLinks : [{ file_url: download.file_url, label: '' }],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta descarga?')) {
      const { error } = await supabase
        .from('mt4_downloads')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchData();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      product_id: '',
      version_name: '',
      version_number: '',
      file_url: '',
      file_size: '',
      release_date: new Date().toISOString().split('T')[0],
      release_notes: '',
      is_active: true,
      download_limit: 1,
      download_links: [],
    });
  };

  const addDownloadLink = () => {
    setFormData({
      ...formData,
      download_links: [...formData.download_links, { file_url: '', label: '' }],
    });
  };

  const removeDownloadLink = (index: number) => {
    setFormData({
      ...formData,
      download_links: formData.download_links.filter((_, i) => i !== index),
    });
  };

  const updateDownloadLink = (index: number, field: keyof DownloadLinkForm, value: string) => {
    const newLinks = [...formData.download_links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, download_links: newLinks });
  };

  const handleResetUserDownload = async (downloadId: string, userId: string) => {
    if (confirm('¿Estás seguro de resetear la descarga de este usuario? Esto le permitirá descargar nuevamente.')) {
      const { error } = await supabase
        .from('user_downloads')
        .delete()
        .eq('download_id', downloadId)
        .eq('user_id', userId);

      if (!error) {
        await fetchData();
        alert('Descarga reseteada exitosamente.');
      } else {
        alert('Error al resetear la descarga: ' + error.message);
      }
    }
  };

  const handleResetAllDownloads = async (downloadId: string) => {
    if (confirm('¿Estás seguro de resetear TODAS las descargas de esta versión? Esto permitirá que todos los usuarios puedan descargar nuevamente.')) {
      const { error } = await supabase
        .from('user_downloads')
        .delete()
        .eq('download_id', downloadId);

      if (!error) {
        await fetchData();
        alert('Todas las descargas de esta versión han sido reseteadas exitosamente.');
      } else {
        alert('Error al resetear las descargas: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Gestionar Descargas MT4</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Descarga
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? 'Editar Descarga' : 'Nueva Descarga'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Producto MT4 *
                </label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.is_premium ? '(Premium)' : '(Gratis)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de Versión *
                </label>
                <input
                  type="text"
                  required
                  value={formData.version_name}
                  onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Alpha Strategy v2.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Número de Versión *
                </label>
                <input
                  type="text"
                  required
                  value={formData.version_number}
                  onChange={(e) => setFormData({ ...formData, version_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="2.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tamaño del Archivo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="15.2 MB"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha de Lanzamiento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Límite de Descargas por Usuario *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.download_limit}
                  onChange={(e) => setFormData({ ...formData, download_limit: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Número de veces que cada usuario puede descargar esta versión (cualquiera de los enlaces)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  URL de Descarga Principal (Compatibilidad) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://1drv.ms/u/c/..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enlace principal (se usará si no hay enlaces adicionales configurados)
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Enlaces de Descarga Adicionales
                  </label>
                  <button
                    type="button"
                    onClick={addDownloadLink}
                    className="flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Enlace
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Puedes agregar múltiples enlaces de descarga para diferentes computadoras. Si no agregas enlaces adicionales, se usará el enlace principal.
                </p>
                
                {formData.download_links.length === 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-600">
                    No hay enlaces adicionales. Se usará el enlace principal.
                  </div>
                )}

                {formData.download_links.map((link, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            URL de Descarga {index + 1} *
                          </label>
                          <input
                            type="url"
                            required
                            value={link.file_url}
                            onChange={(e) => updateDownloadLink(index, 'file_url', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                            placeholder="https://1drv.ms/u/c/..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Etiqueta (Opcional)
                          </label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateDownloadLink(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                            placeholder="Ej: Windows 64-bit, Mac, etc."
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDownloadLink(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                        title="Eliminar enlace"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notas de Versión * (¿Qué hay de nuevo?)
              </label>
              <textarea
                required
                value={formData.release_notes}
                onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={5}
                placeholder="Descripción de las mejoras y cambios en esta versión..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {downloads.map((download) => (
          <div
            key={download.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {download.version_name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      download.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {download.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {download.mt4_products?.is_premium && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Producto: {download.mt4_products?.name}
                </p>
                <p className="text-sm text-slate-500 mb-3">
                  {new Date(download.release_date).toLocaleDateString('es-ES')}
                  {' • '}{download.file_size}
                  {' • v'}{download.version_number}
                </p>
                <p className="text-slate-700 whitespace-pre-line mb-2">{download.release_notes}</p>
                <p className="text-sm text-slate-500 break-all mb-3">
                  URL: {download.file_url}
                </p>
                
                {/* Estadísticas de descargas */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Descargas: {downloadStats[download.id]?.count || 0} usuario(s)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowStats({ ...showStats, [download.id]: !showStats[download.id] })}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {showStats[download.id] ? 'Ocultar' : 'Ver detalles'}
                      </button>
                      {downloadStats[download.id]?.count > 0 && (
                        <button
                          onClick={() => handleResetAllDownloads(download.id)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                          title="Resetear todas las descargas de esta versión"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Resetear todas
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {showStats[download.id] && downloadStats[download.id] && (
                    <div className="mt-3 space-y-2">
                      {downloadStats[download.id].users.length > 0 ? (
                        downloadStats[download.id].users.map((user) => (
                          <div
                            key={user.user_id}
                            className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user.email}</p>
                              <p className="text-xs text-slate-500">
                                Descargado: {new Date(user.downloaded_at).toLocaleString('es-ES')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleResetUserDownload(download.id, user.user_id)}
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                              title="Resetear descarga de este usuario"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-2">
                          No hay descargas registradas aún
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleEdit(download)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar descarga"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(download.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar descarga"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {downloads.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-slate-500">
              No hay descargas creadas. Haz clic en "Nueva Descarga" para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
