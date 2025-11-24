import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validación básica
      if (!email || !password) {
        setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
        setLoading(false);
        return;
      }

      // Verificar configuración de Supabase antes de intentar login
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('🔐 Intentando login:', {
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
        setMessage({ type: 'error', text: errorMsg });
        setLoading(false);
        return;
      }

      // Verificar que Supabase esté configurado
      if (!supabase) {
        const errorMsg = 'Error de configuración. Por favor contacta al administrador.';
        console.error('❌', errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        setLoading(false);
        return;
      }

      console.log('📤 Enviando solicitud de login a Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Mensajes de error más específicos
        let errorMessage = error.message;
        
        console.error('❌ Error de autenticación:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña. Si es un usuario nuevo, regístrate primero.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Usuario no encontrado. ¿Tienes una cuenta? Regístrate primero.';
        } else if (error.status === 400) {
          errorMessage = 'Solicitud inválida. Verifica que el email y contraseña sean correctos.';
        }
        
        setMessage({ type: 'error', text: errorMessage });
      } else if (data?.user) {
        console.log('✅ Login exitoso:', {
          userId: data.user.id,
          email: data.user.email,
        });
        setMessage({ type: 'success', text: '¡Sesión iniciada exitosamente!' });
        // Pequeño delay para mostrar el mensaje de éxito
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        console.warn('⚠️ Login sin error pero sin datos de usuario');
        setMessage({ type: 'error', text: 'No se pudo iniciar sesión. Por favor intenta de nuevo.' });
      }
    } catch (error: any) {
      console.error('❌ Error inesperado durante login:', {
        error,
        message: error?.message,
        stack: error?.stack,
      });
      setMessage({ 
        type: 'error', 
        text: `Error inesperado: ${error?.message || 'Por favor intenta de nuevo.'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}