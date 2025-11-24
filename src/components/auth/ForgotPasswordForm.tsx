import { useState } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validación básica
      if (!email) {
        setError('Por favor ingresa tu correo electrónico');
        setLoading(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Por favor ingresa un correo electrónico válido');
        setLoading(false);
        return;
      }

      console.log('📧 Enviando solicitud de recuperación de contraseña para:', email.trim());

      const result = await resetPassword(email.trim());

      if (result.error) {
        const errorMessage = result.error?.message || result.error?.toString() || 'Error desconocido';
        console.error('❌ Error al enviar email de recuperación:', errorMessage);
        
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          userFriendlyMessage = 'Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.';
        } else if (errorMessage.includes('not found')) {
          // Por seguridad, no revelamos si el email existe o no
          userFriendlyMessage = 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones.';
        } else {
          userFriendlyMessage = 'Error al enviar el email. Por favor intenta de nuevo.';
        }
        
        setError(userFriendlyMessage);
      } else {
        console.log('✅ Email de recuperación enviado exitosamente');
        setSuccess(true);
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

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Email Enviado
          </h3>
          <p className="text-slate-600 mb-4">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Por favor revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            El enlace expirará en 1 hora.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio de sesión
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Recuperar Contraseña
        </h3>
        <p className="text-slate-600">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
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

      {onBack && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-cyan-600 hover:text-cyan-700 font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
}

