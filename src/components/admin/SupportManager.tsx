import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Star } from 'lucide-react';
import { supabase, SupportLink } from '../../lib/supabase';

type FormData = {
  platform: string;
  url: string;
  icon_name: string;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
};

const commonIcons = [
  'MessageCircle',
  'Send',
  'Instagram',
  'Twitter',
  'Facebook',
  'Youtube',
  'Mail',
  'Phone',
  'Globe',
  'Linkedin',
  'Star',
  'Users',
  'MessageSquare',
];

export function SupportManager() {
  const [links, setLinks] = useState<SupportLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    platform: '',
    url: '',
    icon_name: 'MessageCircle',
    is_featured: false,
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_links')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('support_links')
        .update(formData)
        .eq('id', editingId);

      if (!error) {
        await fetchLinks();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('support_links')
        .insert([formData]);

      if (!error) {
        await fetchLinks();
        resetForm();
      }
    }
  };

  const handleEdit = (link: SupportLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon_name: link.icon_name,
      is_featured: link.is_featured,
      sort_order: link.sort_order,
      is_active: link.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este enlace de soporte?')) {
      const { error } = await supabase
        .from('support_links')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchLinks();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      platform: '',
      url: '',
      icon_name: 'MessageCircle',
      is_featured: false,
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
        <h2 className="text-2xl font-bold text-slate-900">Gestionar Canales de Soporte</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Canal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? 'Editar Canal' : 'Nuevo Canal'}
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
                  Nombre de la Plataforma *
                </label>
                <input
                  type="text"
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="WhatsApp VIP, Telegram, Instagram..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Icono (Lucide Icon)
                </label>
                <select
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {commonIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
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
                URL del Canal * (WhatsApp, Telegram, Instagram, etc.)
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://wa.me/1234567890 o https://t.me/tuchannel"
              />
              <p className="text-xs text-slate-500 mt-1">
                WhatsApp: https://wa.me/1234567890 • Telegram: https://t.me/canal
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="is_featured" className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                <Star className="w-5 h-5 text-yellow-500" />
                Destacar este canal (aparecerá grande y primero)
              </label>
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
        {links.map((link) => (
          <div
            key={link.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 hover:shadow-md transition-shadow ${
              link.is_featured ? 'border-yellow-400' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {link.platform}
                  </h3>
                  {link.is_featured && (
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      link.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {link.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">
                  Icono: {link.icon_name} • Orden: {link.sort_order}
                </p>
                <p className="text-slate-700 break-all">
                  {link.url}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(link)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-slate-500">
              No hay canales de soporte creados. Haz clic en "Nuevo Canal" para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
