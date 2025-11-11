import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Image } from 'lucide-react';
import { supabase, PremiumApp } from '../../lib/supabase';

type FormData = {
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  download_url: string;
  category: string;
  sort_order: number;
  is_active: boolean;
};

export function AppsManager() {
  const [apps, setApps] = useState<PremiumApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    video_url: '',
    download_url: '',
    category: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('premium_apps')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setApps(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('premium_apps')
        .update(formData)
        .eq('id', editingId);

      if (!error) {
        await fetchApps();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('premium_apps')
        .insert([formData]);

      if (!error) {
        await fetchApps();
        resetForm();
      }
    }
  };

  const handleEdit = (app: PremiumApp) => {
    setEditingId(app.id);
    setFormData({
      title: app.title,
      description: app.description,
      image_url: app.image_url,
      video_url: app.video_url || '',
      download_url: app.download_url,
      category: app.category,
      sort_order: app.sort_order,
      is_active: app.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta aplicación?')) {
      const { error } = await supabase
        .from('premium_apps')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchApps();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      video_url: '',
      download_url: '',
      category: '',
      sort_order: 0,
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
        <h2 className="text-2xl font-bold text-slate-900">Gestionar Apps Premium</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva App
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? 'Editar App' : 'Nueva App'}
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
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Indicador Fibonacci Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Indicadores, Expert Advisors, Scripts..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
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
                URL de Imagen * (Imgur, Supabase Storage, etc.)
              </label>
              <input
                type="url"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://i.imgur.com/ejemplo.jpg"
              />
              {formData.image_url && (
                <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL de Video (YouTube - opcional)
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL de Descarga * (ZIP del archivo)
              </label>
              <input
                type="url"
                required
                value={formData.download_url}
                onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://tudominio.com/archivos/app.zip"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción * (Usa saltos de línea para listas)
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={8}
                placeholder={`Descripción completa de la aplicación...

Características:
• Característica 1
• Característica 2
• Característica 3`}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
              {app.image_url ? (
                <img
                  src={app.image_url}
                  alt={app.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Image className="w-16 h-16 text-slate-300" />
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                  {app.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    app.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {app.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {app.category && (
                <span className="inline-block bg-cyan-100 text-cyan-700 text-xs font-semibold px-2 py-1 rounded mb-2">
                  {app.category}
                </span>
              )}

              <p className="text-slate-600 text-sm line-clamp-3 mb-3">
                {app.description}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(app)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(app.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {apps.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 text-center">
            <p className="text-slate-500">
              No hay apps creadas. Haz clic en "Nueva App" para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
