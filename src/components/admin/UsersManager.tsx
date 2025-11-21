import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Crown, Mail, Calendar, CheckCircle, XCircle, Shield, Trash2, UserPlus, X, XOctagon, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  subscription_status: string;
  created_at: string;
  stripe_customer_id?: string | null;
}

interface UserWithProducts extends User {
  products: {
    id: string;
    name: string;
    code: string;
  }[];
}

export function UsersManager() {
  const [users, setUsers] = useState<UserWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, is_admin, subscription_status, created_at, stripe_customer_id')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userProducts, error: userProductsError } = await supabase
        .from('user_products')
        .select(`
          id,
          user_id,
          mt4_products (
            name,
            code
          )
        `);

      if (userProductsError) throw userProductsError;

      const usersWithProducts = profiles.map(profile => {
        const products = userProducts
          .filter(up => up.user_id === profile.id)
          .map(up => ({
            id: up.id,
            name: up.mt4_products?.name || '',
            code: up.mt4_products?.code || ''
          }))
          .filter(p => p.name !== '');

        return {
          ...profile,
          products: products as { id: string; name: string; code: string }[]
        };
      });

      setUsers(usersWithProducts);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    const action = currentStatus ? 'remover' : 'otorgar';
    if (!confirm(`¿Seguro que deseas ${action} permisos de administrador?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
      alert(`Permisos de administrador ${currentStatus ? 'removidos' : 'otorgados'} exitosamente`);
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      alert('Error actualizando permisos: ' + error.message);
    }
  }

  async function removeProductAssignment(assignmentId: string) {
    if (!confirm('¿Seguro que deseas eliminar esta asignación de producto?')) return;

    try {
      const { error } = await supabase
        .from('user_products')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      await loadUsers();
      alert('Asignación eliminada exitosamente');
    } catch (error: any) {
      console.error('Error removing product assignment:', error);
      alert('Error eliminando asignación: ' + error.message);
    }
  }

  async function syncSubscription(userId: string, userEmail: string) {
    if (!confirm(`¿Sincronizar la suscripción de ${userEmail}?\n\nEsta acción:\n- Consultará Stripe para obtener el estado actual\n- Actualizará la base de datos con el estado correcto\n- Útil si la suscripción no se sincronizó automáticamente`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error sincronizando suscripción');
      }

      await loadUsers();
      alert(`Suscripción sincronizada exitosamente.\n\nEstado: ${result.subscription?.status || 'N/A'}\nID: ${result.subscription?.id || 'N/A'}`);
    } catch (error: any) {
      console.error('Error syncing subscription:', error);
      alert('Error sincronizando suscripción: ' + error.message);
    }
  }

  async function cancelSubscription(userId: string, userEmail: string) {
    if (!confirm(`¿Cancelar la suscripción de ${userEmail}?\n\nEsta acción:\n- Cancelará la suscripción en Stripe\n- Actualizará el estado a "inactiva"\n- Permitirá que el usuario se suscriba nuevamente`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error cancelando suscripción');
      }

      await loadUsers();
      alert('Suscripción cancelada exitosamente. El usuario puede suscribirse nuevamente.');
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      alert('Error cancelando suscripción: ' + error.message);
    }
  }

  async function deleteUser(userId: string, userEmail: string) {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE al usuario ${userEmail}?\n\nEsta acción NO se puede deshacer y eliminará:\n- El usuario de autenticación\n- Su perfil\n- Todas sus asignaciones de productos\n- Su información de Stripe`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error eliminando usuario');
      }

      await loadUsers();
      alert('Usuario eliminado permanentemente');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Error eliminando usuario: ' + error.message);
    }
  }

  function generateRandomPassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewUserPassword(password);
  }

  async function handleCreateUser() {
    if (!newUserEmail.trim()) {
      alert('Por favor ingresa un email');
      return;
    }

    if (!newUserPassword.trim()) {
      alert('Por favor genera o ingresa una contraseña');
      return;
    }

    try {
      setCreatingUser(true);

      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail.trim(),
        password: newUserPassword,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      if (data.user) {
        alert(`Usuario creado exitosamente!\n\nEmail: ${newUserEmail}\nContraseña temporal: ${newUserPassword}\n\nGuarda esta contraseña y envíala al cliente de forma segura.`);
        setShowCreateModal(false);
        setNewUserEmail('');
        setNewUserPassword('');
        await loadUsers();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message.includes('User already registered')) {
        alert('Este email ya está registrado en el sistema');
      } else {
        alert('Error creando usuario: ' + error.message);
      }
    } finally {
      setCreatingUser(false);
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">
            Total: {users.length} usuarios | Admins: {users.filter(u => u.is_admin).length} |
            Suscripciones activas: {users.filter(u => u.subscription_status === 'active').length}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Crear Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos MT4
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.is_admin ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                        {user.is_admin && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Shield className="w-3 h-3" />
                            <span>Administrador</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {user.is_admin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.products.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.products.map((product) => (
                          <span
                            key={product.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1"
                          >
                            {product.name}
                            <button
                              onClick={() => removeProductAssignment(product.id)}
                              className="ml-1 hover:text-red-600 transition-colors"
                              title="Eliminar asignación"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin productos</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription_status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          user.is_admin
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                      </button>
                      {(user.stripe_customer_id || user.subscription_status !== 'inactive') && (
                        <button
                          onClick={() => syncSubscription(user.id, user.email)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                          title="Sincronizar suscripción desde Stripe"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Sincronizar
                        </button>
                      )}
                      {user.subscription_status === 'active' && (
                        <button
                          onClick={() => cancelSubscription(user.id, user.email)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-1"
                          title="Cancelar suscripción (para pruebas)"
                        >
                          <XOctagon className="w-3 h-3" />
                          Cancelar Suscripción
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Eliminar usuario permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
          </p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Crear Nuevo Usuario</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUserEmail('');
                  setNewUserPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Cliente
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña Temporal
                  </label>
                  <button
                    onClick={generateRandomPassword}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Generar Automática
                  </button>
                </div>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Contraseña temporal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta contraseña se mostrará solo una vez. Guárdala y envíala al cliente de forma segura.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El cliente podrá cambiar su contraseña después de iniciar sesión en su perfil.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUserEmail('');
                    setNewUserPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={creatingUser}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={creatingUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {creatingUser ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
