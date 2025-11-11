import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Package, Download, Plus, X, Save, Calendar, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  is_premium: boolean;
}

interface Download {
  id: string;
  product_id: string;
  version_name: string;
  version_number: string;
  file_url: string;
  file_size: string;
  release_date: string;
  release_notes: string;
  is_active: boolean;
}

interface UserProduct {
  id: string;
  user_id: string;
  product_id: string;
  assigned_at: string;
  notes: string;
  profiles: {
    email: string;
    subscription_status: string;
  };
  mt4_products: {
    name: string;
  };
}

interface User {
  id: string;
  email: string;
}

export default function MT4ProductsManager() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'downloads'>('assignments');
  const [products, setProducts] = useState<Product[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const [downloadForm, setDownloadForm] = useState({
    product_id: '',
    version_name: '',
    version_number: '',
    file_url: '',
    file_size: '',
    release_date: new Date().toISOString().split('T')[0],
    release_notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [productsRes, downloadsRes, userProductsRes, usersRes] = await Promise.all([
        supabase.from('mt4_products').select('*').order('is_premium', { ascending: false }),
        supabase.from('mt4_downloads').select('*').order('release_date', { ascending: false }),
        supabase.from('user_products').select('*, mt4_products(name)').order('assigned_at', { ascending: false }),
        supabase.from('profiles').select('id, email, subscription_status').order('email'),
      ]);

      if (productsRes.error) {
        console.error('Error loading products:', productsRes.error);
      }
      if (downloadsRes.error) {
        console.error('Error loading downloads:', downloadsRes.error);
      }
      if (userProductsRes.error) {
        console.error('Error loading user products:', userProductsRes.error);
      }
      if (usersRes.error) {
        console.error('Error loading users:', usersRes.error);
      }

      if (productsRes.data) setProducts(productsRes.data);
      if (downloadsRes.data) setDownloads(downloadsRes.data);
      if (userProductsRes.data) setUserProducts(userProductsRes.data as any);
      if (usersRes.data) setUsers(usersRes.data);

      console.log('Loaded data:', {
        products: productsRes.data?.length || 0,
        downloads: downloadsRes.data?.length || 0,
        userProducts: userProductsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
      });

      console.log('User Products Details:', userProductsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignProduct() {
    if (!selectedUser || !selectedProduct) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('user_products').insert({
        user_id: selectedUser,
        product_id: selectedProduct,
        assigned_by: user?.id,
        notes: assignmentNotes,
      });

      if (error) throw error;

      setShowAssignModal(false);
      setSelectedUser('');
      setSelectedProduct('');
      setAssignmentNotes('');
      loadData();
    } catch (error: any) {
      alert('Error asignando producto: ' + error.message);
    }
  }

  async function handleRemoveAssignment(id: string) {
    if (!confirm('¿Seguro que deseas eliminar esta asignación?')) return;

    try {
      const { error } = await supabase.from('user_products').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error eliminando asignación: ' + error.message);
    }
  }

  async function handleAddDownload() {
    if (!downloadForm.product_id || !downloadForm.version_name || !downloadForm.file_url) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    try {
      const { error } = await supabase.from('mt4_downloads').insert(downloadForm);
      if (error) throw error;

      setShowDownloadModal(false);
      setDownloadForm({
        product_id: '',
        version_name: '',
        version_number: '',
        file_url: '',
        file_size: '',
        release_date: new Date().toISOString().split('T')[0],
        release_notes: '',
      });
      loadData();
    } catch (error: any) {
      alert('Error agregando descarga: ' + error.message);
    }
  }

  async function handleToggleDownload(id: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('mt4_downloads')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error actualizando descarga: ' + error.message);
    }
  }

  async function handleDeleteDownload(id: string) {
    if (!confirm('¿Seguro que deseas eliminar esta descarga?')) return;

    try {
      const { error } = await supabase.from('mt4_downloads').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error eliminando descarga: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión MT4</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Asignación de Productos
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'downloads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="inline-block w-5 h-5 mr-2" />
            Gestión de Descargas
          </button>
        </nav>
      </div>

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Niveles de Acceso:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Acceso Completo:</strong> Usuario con suscripción activa - Acceso a Descargas MT4, Apps Premium y Soporte</li>
              <li><strong>Solo Descargas MT4:</strong> Usuario con Alpha Strategy sin suscripción - Solo acceso a actualizaciones MT4</li>
              <li><strong>Sin Acceso:</strong> Usuario sin producto ni suscripción - Debe comprar suscripción</li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Asigna productos premium a usuarios específicos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadData()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                title="Refrescar datos"
              >
                <RefreshCw className="w-5 h-5" />
                Refrescar
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Asignar Producto
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                    Estado Suscripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Nivel de Acceso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                    Fecha Asignación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Notas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userProducts.map((assignment) => {
                  const user = users.find(u => u.id === assignment.user_id);
                  const hasSubscription = user?.subscription_status === 'active';
                  const hasAlphaStrategy = assignment.mt4_products?.name === 'Alpha Strategy';

                  let accessLevel = '';
                  let accessColor = '';

                  if (hasSubscription) {
                    accessLevel = 'Acceso Completo';
                    accessColor = 'bg-green-100 text-green-800';
                  } else if (hasAlphaStrategy) {
                    accessLevel = 'Solo Descargas MT4';
                    accessColor = 'bg-yellow-100 text-yellow-800';
                  } else {
                    accessLevel = 'Sin Acceso';
                    accessColor = 'bg-gray-100 text-gray-800';
                  }

                  return (
                    <tr key={assignment.id}>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user?.email || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {assignment.mt4_products?.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          hasSubscription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {hasSubscription ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${accessColor}`}>
                          {accessLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assignment.assigned_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {assignment.notes || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="inline-flex items-center justify-center text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg p-2 transition-colors"
                          title="Eliminar asignación"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Gestiona las versiones disponibles para descarga
            </p>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Agregar Descarga
            </button>
          </div>

          <div className="grid gap-4">
            {downloads.map((download) => {
              const product = products.find((p) => p.id === download.product_id);
              return (
                <div
                  key={download.id}
                  className={`bg-white rounded-lg shadow p-6 ${
                    !download.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {download.version_name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {product?.name}
                        </span>
                        {!download.is_active && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Inactiva
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Versión:</strong> {download.version_number}
                        </p>
                        <p>
                          <strong>Tamaño:</strong> {download.file_size || 'N/A'}
                        </p>
                        <p>
                          <strong>Fecha:</strong>{' '}
                          {new Date(download.release_date).toLocaleDateString()}
                        </p>
                        {download.release_notes && (
                          <p className="mt-2">
                            <strong>Novedades:</strong>
                            <br />
                            {download.release_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleDownload(download.id, download.is_active)}
                        className={`px-3 py-1 rounded text-sm ${
                          download.is_active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {download.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteDownload(download.id)}
                        className="px-3 py-1 rounded text-sm bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Asignar Producto a Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.is_premium && '(Premium)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Información adicional..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAssignProduct}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Asignar
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser('');
                  setSelectedProduct('');
                  setAssignmentNotes('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Descarga</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  value={downloadForm.product_id}
                  onChange={(e) =>
                    setDownloadForm({ ...downloadForm, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Versión *
                  </label>
                  <input
                    type="text"
                    value={downloadForm.version_name}
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, version_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Versión 2.0 Alpha Strategy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Versión
                  </label>
                  <input
                    type="text"
                    value={downloadForm.version_number}
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, version_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2.0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Archivo *
                </label>
                <input
                  type="url"
                  value={downloadForm.file_url}
                  onChange={(e) =>
                    setDownloadForm({ ...downloadForm, file_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/archivo.zip"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño del Archivo
                  </label>
                  <input
                    type="text"
                    value={downloadForm.file_size}
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, file_size: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="9.17 MB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Lanzamiento
                  </label>
                  <input
                    type="date"
                    value={downloadForm.release_date}
                    onChange={(e) =>
                      setDownloadForm({ ...downloadForm, release_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novedades de la Versión
                </label>
                <textarea
                  value={downloadForm.release_notes}
                  onChange={(e) =>
                    setDownloadForm({ ...downloadForm, release_notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="- Nueva funcionalidad X&#10;- Mejora en Y&#10;- Corrección de bug Z"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddDownload}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadForm({
                    product_id: '',
                    version_name: '',
                    version_number: '',
                    file_url: '',
                    file_size: '',
                    release_date: new Date().toISOString().split('T')[0],
                    release_notes: '',
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
