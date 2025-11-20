import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
};

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      const { error } = mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

      if (error) {
        // Mensajes de error más específicos
        let errorMessage = error.message;
        
        console.error(`❌ Error de ${mode}:`, {
          message: error.message,
          status: (error as any).status,
          name: error.name,
        });
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña. Si es un usuario nuevo, regístrate primero.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'Este email ya está registrado. Inicia sesión en su lugar.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if ((error as any).status === 400) {
          errorMessage = 'Solicitud inválida. Verifica que el email y contraseña sean correctos.';
        }
        
        setError(errorMessage);
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {mode === 'signin' ? 'Bienvenido de Nuevo' : 'Crear Cuenta'}
          </h2>
          <p className="text-slate-600 mb-8">
            {mode === 'signin'
              ? 'Accede a tu portal premium'
              : 'Comienza tu suscripción premium'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

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
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
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

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              {mode === 'signin'
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
