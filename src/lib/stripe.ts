import { supabase } from './supabase';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  priceId,
  mode,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token found');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL no está configurada. Por favor, verifica tus variables de entorno.');
  }

  if (!priceId) {
    throw new Error('Price ID no está definido. Por favor, verifica la configuración de Stripe.');
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Error al crear la sesión de checkout';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No se recibió URL de checkout de Stripe');
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que VITE_SUPABASE_URL esté correctamente configurada y que la función edge esté desplegada.');
    }
    throw error;
  }
}