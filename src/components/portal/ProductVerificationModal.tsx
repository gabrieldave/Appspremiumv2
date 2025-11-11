import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProductVerificationModalProps {
  onComplete: () => void;
}

export function ProductVerificationModal({ onComplete }: ProductVerificationModalProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState<'question' | 'password' | 'processing' | 'success' | 'error'>('question');
  const [hasProduct, setHasProduct] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [assignedProduct, setAssignedProduct] = useState('');

  const ALPHA_PASSWORD = 'Alpha trader';

  async function assignProduct(productCode: string) {
    if (!profile) return false;

    try {
      const { data: products } = await supabase
        .from('mt4_products')
        .select('id')
        .eq('code', productCode)
        .single();

      if (!products) {
        throw new Error('Producto no encontrado');
      }

      const { data: existing } = await supabase
        .from('user_products')
        .select('id')
        .eq('user_id', profile.id)
        .eq('product_id', products.id)
        .maybeSingle();

      if (existing) {
        return true;
      }

      const { error } = await supabase.from('user_products').insert({
        user_id: profile.id,
        product_id: products.id,
        notes: 'Asignado automáticamente tras verificación de suscripción',
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error asignando producto:', error);
      return false;
    }
  }

  async function handleQuestionResponse(hasIt: boolean) {
    setHasProduct(hasIt);
    if (hasIt) {
      setStep('password');
    } else {
      setStep('processing');
      const success = await assignProduct('alpha_lite');
      if (success) {
        setAssignedProduct('Alpha Lite');
        setStep('success');
      } else {
        setError('Error al asignar el producto. Por favor contacta a soporte.');
        setStep('error');
      }
    }
  }

  async function handlePasswordSubmit() {
    if (password.trim() === ALPHA_PASSWORD) {
      setStep('processing');
      const success = await assignProduct('alpha_strategy');
      if (success) {
        setAssignedProduct('Alpha Strategy');
        setStep('success');
      } else {
        setError('Error al asignar el producto. Por favor contacta a soporte.');
        setStep('error');
      }
    } else {
      setStep('processing');
      const success = await assignProduct('alpha_lite');
      if (success) {
        setAssignedProduct('Alpha Lite');
        setStep('success');
      } else {
        setError('Error al asignar el producto. Por favor contacta a soporte.');
        setStep('error');
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        {step === 'question' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Bienvenido!
              </h2>
              <p className="text-slate-600">
                Para personalizar tu experiencia, necesitamos saber si ya compraste nuestro producto premium.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium">
                ¿Ya compraste el producto Alpha Strategy?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleQuestionResponse(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Sí, tengo Alpha Strategy
              </button>
              <button
                onClick={() => handleQuestionResponse(false)}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                No, solo la suscripción
              </button>
            </div>
          </>
        )}

        {step === 'password' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Verificación Requerida
              </h2>
              <p className="text-slate-600">
                Por favor, ingresa la contraseña que recibiste con tu compra de Alpha Strategy.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña de Verificación
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Nota:</strong> Si no recuerdas tu contraseña o ingresaste una incorrecta, se te asignará automáticamente el plan Alpha Lite.
                </p>
              </div>

              <button
                onClick={handlePasswordSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Verificar
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Configurando tu cuenta...
            </h2>
            <p className="text-slate-600">
              Esto solo tomará un momento
            </p>
          </div>
        )}

        {step === 'success' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Todo Listo!
              </h2>
              <p className="text-slate-600 mb-4">
                Tu cuenta ha sido configurada exitosamente.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  Producto Asignado:
                </p>
                <p className="text-lg font-bold text-green-600">
                  {assignedProduct}
                </p>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Continuar al Portal
            </button>
          </>
        )}

        {step === 'error' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Error
              </h2>
              <p className="text-slate-600 mb-4">
                {error}
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
