import React, { useState } from 'react';
import { X, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
};

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email) {
        setError('Por favor ingresa tu correo electrónico');
        setLoading(false);
        return;
      }

      // Obtener la URL de redirección desde las variables de entorno o usar la URL actual
      const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      
      console.log('📧 Enviando solicitud de reset de contraseña:', {
        email: email.trim(),
        redirectUrl,
      });

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${redirectUrl}/reset-password`,
      });

      if (resetError) {
        console.error('❌ Error al enviar reset de contraseña:', resetError);
        setError('No se pudo enviar el email. Verifica que el correo sea correcto.');
      } else {
        console.log('✅ Email de reset enviado exitosamente');
        setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada.');
        setEmail('');
      }
    } catch (err: any) {
      console.error('❌ Error inesperado al resetear contraseña:', err);
      setError(`Error inesperado: ${err?.message || 'Por favor intenta de nuevo.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validación básica
      if (!email || !password) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      if (mode === 'signup' && password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Verificar configuración de Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log(`🔐 Intentando ${mode === 'signin' ? 'login' : 'registro'}:`, {
        email: email.trim(),
        supabaseUrl: supabaseUrl ? '✅ Configurada' : '❌ Faltante',
        supabaseAnonKey: supabaseAnonKey ? '✅ Configurada' : '❌ Faltante',
      });

      if (!supabaseUrl || !supabaseAnonKey) {
        const missing = [];
        if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
        if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
        
        const errorMsg = `Error de configuración: Faltan variables de entorno (${missing.join(', ')}). Por favor verifica la configuración en Vercel.`;
        console.error('❌', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log(`📤 Enviando solicitud de ${mode === 'signin' ? 'login' : 'registro'} a Supabase...`);
      
      let result;
      try {
        result = mode === 'signin'
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password);
      } catch (err: any) {
        console.error('❌ Error al llamar signIn/signUp:', err);
        setError(`Error al procesar la solicitud: ${err?.message || 'Por favor intenta de nuevo.'}`);
        setLoading(false);
        return;
      }

      if (!result) {
        console.error('❌ No se recibió respuesta de signIn/signUp');
        setError('No se recibió respuesta del servidor. Por favor intenta de nuevo.');
        setLoading(false);
        return;
      }

      const { error } = result;

      if (error) {
        // Obtener el mensaje de error de forma segura
        const errorMessage = error?.message || error?.toString() || 'Error desconocido';
        const errorStatus = (error as any)?.status;
        const errorName = error?.name || 'Error';
        
        console.error(`❌ Error de ${mode}:`, {
          error: error,
          message: errorMessage,
          status: errorStatus,
          name: errorName,
          rawError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
        
        // Mensajes de error más específicos
        let userFriendlyMessage = errorMessage;
        
        if (errorMessage.includes('Invalid login credentials')) {
          userFriendlyMessage = 'Credenciales inválidas. Verifica tu email y contraseña. Si es un usuario nuevo, regístrate primero.';
        } else if (errorMessage.includes('Email not confirmed')) {
          userFriendlyMessage = 'Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
        } else if (errorMessage.includes('User already registered')) {
          userFriendlyMessage = 'Este email ya está registrado. Inicia sesión en su lugar.';
        } else if (errorMessage.includes('Password should be at least')) {
          userFriendlyMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (errorStatus === 400) {
          userFriendlyMessage = 'Solicitud inválida. Verifica que el email y contraseña sean correctos.';
        } else if (errorMessage === 'Error desconocido' || !errorMessage) {
          userFriendlyMessage = 'Ocurrió un error al intentar iniciar sesión. Por favor intenta de nuevo.';
        }
        
        setError(userFriendlyMessage);
      } else {
        if (mode === 'signup') {
          console.log('✅ Registro exitoso');
          setError('');
          setError('Cuenta creada. Por favor verifica tu email antes de iniciar sesión.');
          setTimeout(() => {
            setMode('signin');
            setError('');
          }, 3000);
        } else {
          console.log('✅ Login exitoso');
          onClose();
        }
      }
    } catch (err: any) {
      console.error('❌ Error inesperado:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
      });
      setError(`Error inesperado: ${err?.message || 'Por favor intenta de nuevo.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {mode === 'forgot-password' && (
            <button
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('');
                setEmail('');
              }}
              className="mb-4 flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a iniciar sesión
            </button>
          )}

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {mode === 'signin' 
              ? 'Bienvenido de Nuevo' 
              : mode === 'signup' 
              ? 'Crear Cuenta' 
              : 'Recuperar Contraseña'}
          </h2>
          <p className="text-slate-600 mb-8">
            {mode === 'signin'
              ? 'Accede a tu portal premium'
              : mode === 'signup'
              ? 'Comienza tu suscripción premium'
              : 'Te enviaremos un enlace para restablecer tu contraseña'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {mode === 'forgot-password' ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Enlace de Recuperación'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Contraseña
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                        setSuccess('');
                      }}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </button>
            </form>
          )}

          {mode !== 'forgot-password' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                  setSuccess('');
                }}
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                {mode === 'signin'
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
