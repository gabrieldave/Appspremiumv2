import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  is_premium: boolean;
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
  subscription_status: string;
}

export default function MT4ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [productsRes, userProductsRes, usersRes] = await Promise.all([
        supabase.from('mt4_products').select('*').order('is_premium', { ascending: false }),
        supabase.from('user_products').select('*, mt4_products(name)').order('assigned_at', { ascending: false }),
        supabase.from('profiles').select('id, email, subscription_status').order('email'),
      ]);

      if (productsRes.error) {
        console.error('Error loading products:', productsRes.error);
      }
      if (userProductsRes.error) {
        console.error('Error loading user products:', userProductsRes.error);
      }
      if (usersRes.error) {
        console.error('Error loading users:', usersRes.error);
      }

      if (productsRes.data) setProducts(productsRes.data);
      if (userProductsRes.data) setUserProducts(userProductsRes.data as any);
      if (usersRes.data) setUsers(usersRes.data);

      console.log('Loaded data:', {
        products: productsRes.data?.length || 0,
        userProducts: userProductsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
      });
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
        <h2 className="text-2xl font-bold text-gray-900">Gestión MT4 - Asignación de Productos</h2>
      </div>

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
    </div>
  );
}
