import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { supabase, SocialMediaLink } from '../../lib/supabase';
import * as LucideIcons from 'lucide-react';

type FormData = {
  platform: string;
  url: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
};

const commonIcons = [
  'Facebook',
  'Instagram',
  'Twitter',
  'Youtube',
  'Linkedin',
  'Tiktok',
  'MessageCircle',
  'Send',
  'Share2',
];

export function SocialMediaManager() {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    platform: '',
    url: '',
    icon_name: 'Share2',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('social_media_links')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching social media links:', error);
      setMessage({ type: 'error', text: `Error al cargar enlaces: ${error.message}` });
    } else if (data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('social_media_links')
          .update(formData)
          .eq('id', editingId);

        if (error) {
          console.error('Error updating link:', error);
          setMessage({ type: 'error', text: `Error al actualizar: ${error.message}` });
        } else {
          setMessage({ type: 'success', text: 'Enlace actualizado exitosamente' });
          await fetchLinks();
          setTimeout(() => {
            resetForm();
            setMessage(null);
          }, 1500);
        }
      } else {
        const { error } = await supabase
          .from('social_media_links')
          .insert([formData]);

        if (error) {
          console.error('Error creating link:', error);
          setMessage({ type: 'error', text: `Error al crear: ${error.message}` });
        } else {
          setMessage({ type: 'success', text: 'Enlace creado exitosamente' });
          await fetchLinks();
          setTimeout(() => {
            resetForm();
            setMessage(null);
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Error saving link:', error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (link: SocialMediaLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon_name: link.icon_name,
      sort_order: link.sort_order,
      is_active: link.is_active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este enlace?')) {
      return;
    }

    const { error } = await supabase
      .from('social_media_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting link:', error);
      setMessage({ type: 'error', text: `Error al eliminar: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'Enlace eliminado exitosamente' });
      await fetchLinks();
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: '',
      url: '',
      icon_name: 'Share2',
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getIcon = (iconName: string) => {
    try {
      const IconComponent = (LucideIcons as any)[iconName];
      if (IconComponent && typeof IconComponent === 'function') {
        return IconComponent;
      }
    } catch (error) {
      console.warn(`Icono "${iconName}" no encontrado, usando Share2 por defecto`);
    }
    return LucideIcons.Share2;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestionar Redes Sociales</h2>
          <p className="text-slate-600 mt-1">Administra los enlaces de redes sociales que aparecen en el menú</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Enlace
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? 'Editar Enlace' : 'Nuevo Enlace'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Plataforma *
              </label>
              <input
                type="text"
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Ej: Facebook, Instagram, WhatsApp, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Icono (Nombre de Lucide Icon) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Facebook, Instagram, Twitter, etc."
                />
                <div className="flex items-center justify-center px-4 py-2 bg-slate-100 rounded-lg">
                  {(() => {
                    const Icon = getIcon(formData.icon_name);
                    return <Icon className="w-5 h-5 text-slate-600" />;
                  })()}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Iconos comunes: {commonIcons.join(', ')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    formData.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {formData.is_active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingId ? 'Actualizar' : 'Crear'} Enlace
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Icono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Plataforma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay enlaces. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                links.map((link) => {
                  const Icon = getIcon(link.icon_name);
                  return (
                    <tr key={link.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Icon className="w-5 h-5 text-slate-600" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{link.platform}</div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-600 hover:text-cyan-700 truncate block max-w-md"
                        >
                          {link.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{link.sort_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            link.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {link.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(link)}
                            className="text-cyan-600 hover:text-cyan-700 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

