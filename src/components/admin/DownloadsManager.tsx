import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { supabase, MT4Download, MT4Product } from '../../lib/supabase';

type FormData = {
  product_id: string;
  version_name: string;
  version_number: string;
  file_url: string;
  file_size: string;
  release_date: string;
  release_notes: string;
  is_active: boolean;
};

export function DownloadsManager() {
  const [downloads, setDownloads] = useState<MT4Download[]>([]);
  const [products, setProducts] = useState<MT4Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    product_id: '',
    version_name: '',
    version_number: '',
    file_url: '',
    file_size: '',
    release_date: new Date().toISOString().split('T')[0],
    release_notes: '',
    is_active: true,
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
        mt4_products(*)
      `)
      .order('release_date', { ascending: false });

    if (productsData) setProducts(productsData);
    if (downloadsData) setDownloads(downloadsData as any);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('mt4_downloads')
        .update(formData)
        .eq('id', editingId);

      if (!error) {
        await fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('mt4_downloads')
        .insert([formData]);

      if (!error) {
        await fetchData();
        resetForm();
      }
    }
  };

  const handleEdit = (download: MT4Download) => {
    setEditingId(download.id);
    setFormData({
      product_id: download.product_id,
      version_name: download.version_name,
      version_number: download.version_number,
      file_url: download.file_url,
      file_size: download.file_size || '',
      release_date: download.release_date.split('T')[0],
      release_notes: download.release_notes,
      is_active: download.is_active,
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
    });
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
                URL de Descarga *
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
                Usa enlaces directos de descarga de OneDrive, Dropbox, Google Drive, etc.
              </p>
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
                <p className="text-sm text-slate-500 break-all">
                  URL: {download.file_url}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(download)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(download.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
