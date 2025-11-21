import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SuccessPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  const assignAlphaLite = useCallback(async (userId: string) => {
    try {
      // Buscar el producto Alpha Lite
      const { data: product } = await supabase
        .from('mt4_products')
        .select('id')
        .eq('code', 'alpha_lite')
        .single();

      if (!product) {
        console.error('Producto Alpha Lite no encontrado');
        return false;
      }

      // Verificar si ya tiene el producto asignado
      const { data: existing } = await supabase
        .from('user_products')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        return true; // Ya tiene el producto
      }

      // Asignar Alpha Lite automáticamente
      const { error } = await supabase.from('user_products').insert({
        user_id: userId,
        product_id: product.id,
        notes: 'Asignado automáticamente tras suscripción exitosa',
      });

      if (error) {
        console.error('Error asignando Alpha Lite:', error);
        return false;
      }

      console.log('✅ Alpha Lite asignado automáticamente');
      return true;
    } catch (error) {
      console.error('Error en assignAlphaLite:', error);
      return false;
    }
  }, []);

  const checkAndAssignProduct = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error obteniendo usuario:', userError);
        // Esperar un poco y redirigir
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // Verificar si ya tiene productos asignados
      const { data: userProducts, error: productsError } = await supabase
        .from('user_products')
        .select('id')
        .eq('user_id', user.id);

      if (productsError) {
        console.error('Error verificando productos:', productsError);
      }

      const hasProducts = (userProducts?.length || 0) > 0;

      if (!hasProducts) {
        // Asignar Alpha Lite automáticamente
        setIsAssigning(true);
        await assignAlphaLite(user.id);
        setIsAssigning(false);
      }

      startRedirectTimer();
    } catch (error) {
      console.error('Error checking products:', error);
      startRedirectTimer();
    } finally {
      setIsChecking(false);
      setIsAssigning(false);
    }
  }, [navigate, assignAlphaLite]);

  useEffect(() => {
    checkAndAssignProduct();
  }, [checkAndAssignProduct]);

  function startRedirectTimer() {
    setTimeout(() => {
      navigate('/portal');
    }, 3000);
  }

  if (isChecking || isAssigning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">
            {isAssigning ? 'Configurando tu cuenta...' : 'Verificando tu suscripción...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pago Exitoso</h1>
          <p className="text-slate-600 mb-4">
            Gracias por tu suscripción. Se te ha asignado automáticamente el plan Alpha Lite.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Los administradores pueden actualizar tu plan a Alpha Strategy si es necesario.
          </p>
          <p className="text-sm text-slate-500">
            Serás redirigido automáticamente en 3 segundos...
          </p>
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
            onClick={() => navigate('/portal')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Ver Mi Perfil
          </button>
        </div>
      </div>
    </div>
  );
}