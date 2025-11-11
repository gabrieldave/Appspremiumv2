import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductVerificationModal } from '../components/portal/ProductVerificationModal';
import { supabase } from '../lib/supabase';

export function SuccessPage() {
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkUserProducts();
  }, []);

  async function checkUserProducts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userProducts } = await supabase
        .from('user_products')
        .select('id')
        .eq('user_id', user.id);

      const hasProducts = (userProducts?.length || 0) > 0;

      if (!hasProducts) {
        setShowVerificationModal(true);
      } else {
        startRedirectTimer();
      }
    } catch (error) {
      console.error('Error checking products:', error);
      startRedirectTimer();
    } finally {
      setIsChecking(false);
    }
  }

  function startRedirectTimer() {
    setTimeout(() => {
      navigate('/portal');
    }, 3000);
  }

  function handleVerificationComplete() {
    setShowVerificationModal(false);
    navigate('/portal');
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pago Exitoso</h1>
            <p className="text-slate-600 mb-4">
              Gracias por tu suscripción. Ahora tienes acceso completo a todas las funciones premium.
            </p>
            {!showVerificationModal && (
              <p className="text-sm text-slate-500">
                Serás redirigido automáticamente en 3 segundos...
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/portal')}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              Ir al Portal Premium
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/portal/profile')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Ver Mi Perfil
            </button>
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <ProductVerificationModal onComplete={handleVerificationComplete} />
      )}
    </>
  );
}