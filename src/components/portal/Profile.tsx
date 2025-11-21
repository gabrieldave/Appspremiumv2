import { useState } from 'react';
import { User, Mail, Key, CreditCard, CheckCircle, XCircle, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useStripePrices } from '../../hooks/useStripePrices';

export function Profile() {
  const { user, profile, updatePassword } = useAuth();
  const { prices } = useStripePrices();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setNewPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setMessage({
          type: 'error',
          text: 'Debes iniciar sesión para suscribirte.',
        });
        setLoading(false);
        return;
      }

      if (prices.length === 0) {
        setMessage({
          type: 'error',
          text: 'No hay planes disponibles en este momento.',
        });
        setLoading(false);
        return;
      }

      const product = prices[0];
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_id: product.price_id,
            mode: product.mode,
            success_url: `${window.location.origin}/portal/profile?success=true`,
            cancel_url: `${window.location.origin}/portal/profile?canceled=true`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('No se recibió URL de checkout');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la suscripción. Intenta de nuevo.';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setMessage({
          type: 'error',
          text: 'Debes iniciar sesión para acceder a la facturación.',
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al acceder al portal de facturación');
      }

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al acceder al portal de facturación. Intenta de nuevo.';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string, isAdmin: boolean) => {
    // Si es admin, siempre mostrar como activa
    if (isAdmin) {
      return {
        label: 'Activa (Admin)',
        color: 'text-green-700 bg-green-100 border-green-200',
        icon: CheckCircle,
      };
    }

    switch (status) {
      case 'active':
        return {
          label: 'Activa',
          color: 'text-green-700 bg-green-100 border-green-200',
          icon: CheckCircle,
        };
      case 'trialing':
        return {
          label: 'Período de Prueba',
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          icon: CheckCircle,
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: 'text-orange-700 bg-orange-100 border-orange-200',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'Inactiva',
          color: 'text-red-700 bg-red-100 border-red-200',
          icon: XCircle,
        };
    }
  };

  const isAdmin = profile?.is_admin === true;
  const displayStatus = isAdmin ? 'active' : (profile?.subscription_status || 'inactive');
  const statusInfo = getStatusInfo(displayStatus, isAdmin);
  const StatusIcon = statusInfo.icon;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Perfil</h1>
        <p className="text-slate-600">
          Gestiona tu cuenta y configuración de suscripción
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Información de Cuenta</h2>
                <p className="text-sm text-slate-500">Tus datos personales</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User className="w-4 h-4" />
                  ID de Usuario
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-mono text-sm">
                  {user?.id}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Cambiar Contraseña</h2>
                <p className="text-sm text-slate-500">Actualiza tu contraseña</p>
              </div>
            </div>

            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded-lg border ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="Repite la contraseña"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-400 disabled:to-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Contraseña'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Suscripción</h2>
                <p className="text-sm text-slate-500">Estado actual</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Estado
                </label>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${statusInfo.color} font-semibold`}>
                  <StatusIcon className="w-5 h-5" />
                  {statusInfo.label}
                </div>
              </div>

              {profile?.subscription_end_date && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Próxima Renovación
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700">
                    {new Date(profile.subscription_end_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}

              {isAdmin || profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing' ? (
                <>
                  <button
                    onClick={handleManageBilling}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-400 disabled:to-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Gestionar Facturación
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    Administra tu suscripción y métodos de pago
                  </p>
                </>
              ) : !isAdmin ? (
                <>
                  {prices.length > 0 ? (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-slate-900 mb-1">{prices[0].name}</h4>
                            <p className="text-sm text-slate-600 mb-2">
                              {prices[0].description}
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {prices[0].currency_symbol}{prices[0].price.toFixed(2)}{' '}
                              <span className="text-sm font-normal text-slate-600">{prices[0].currency.toUpperCase()}/mes</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Suscribirme Ahora
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 text-center">
                        Cancela en cualquier momento desde tu portal de facturación
                      </p>
                    </>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-slate-600">Cargando planes disponibles...</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <h3 className="font-bold text-slate-900 mb-3">¿Necesitas Ayuda?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Nuestro equipo de soporte está disponible 24/7 para asistirte.
            </p>
            <a
              href="https://wa.me/5215645530082"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
            >
              Ir a Soporte VIP →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
