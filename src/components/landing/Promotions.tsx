import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Play, Image as ImageIcon } from 'lucide-react';
import { supabase, type Promotion, type PromotionImage } from '../../lib/supabase';

export function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionImages, setPromotionImages] = useState<Record<string, PromotionImage[]>>({});
  const [expandedPromotions, setExpandedPromotions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);

      // Cargar imágenes adicionales para cada promoción
      const imagesMap: Record<string, PromotionImage[]> = {};
      for (const promo of data || []) {
        const { data: images } = await supabase
          .from('promotion_images')
          .select('*')
          .eq('promotion_id', promo.id)
          .order('sort_order', { ascending: true });
        if (images) {
          imagesMap[promo.id] = images;
        }
      }
      setPromotionImages(imagesMap);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePromotion = (id: string) => {
    const newExpanded = new Set(expandedPromotions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPromotions(newExpanded);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url;
  };

  if (loading) {
    return (
      <section id="promociones" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse text-slate-400">Cargando promociones...</div>
          </div>
        </div>
      </section>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <section id="promociones" className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Promociones Especiales
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Descubre nuestras ofertas exclusivas y oportunidades limitadas
          </p>
        </div>

        <div className="space-y-4">
          {promotions.map((promotion) => {
            const isExpanded = expandedPromotions.has(promotion.id);
            const videoEmbedUrl = promotion.video_url ? getYouTubeEmbedUrl(promotion.video_url) : null;

            return (
              <div
                key={promotion.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 transition-all hover:shadow-xl"
              >
                {/* Header - Always Visible */}
                <button
                  onClick={() => togglePromotion(promotion.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {promotion.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={promotion.image_url}
                          alt={promotion.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {promotion.title}
                      </h3>
                      <p className="text-slate-600 line-clamp-2 mb-2">
                        {promotion.description}
                      </p>
                      {/* Precios */}
                      {(promotion.original_price || promotion.offer_price) && (
                        <div className="flex items-center gap-3">
                          {promotion.original_price && promotion.offer_price && (
                            <>
                              <span className="text-lg font-bold text-slate-900">
                                ${promotion.offer_price.toFixed(2)}
                              </span>
                              <span className="text-sm text-slate-500 line-through">
                                ${promotion.original_price.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                {Math.round(((promotion.original_price - promotion.offer_price) / promotion.original_price) * 100)}% OFF
                              </span>
                            </>
                          )}
                          {promotion.offer_price && !promotion.original_price && (
                            <span className="text-lg font-bold text-slate-900">
                              ${promotion.offer_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-cyan-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-cyan-600" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Aclaración de Producto Separado */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Producto Independiente
                          </h4>
                          <p className="text-sm text-blue-800">
                            Este es un producto separado de la suscripción SaaS de $20/mes. No está incluido en la suscripción premium. Es una oferta especial independiente.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Precios Destacados */}
                    {(promotion.original_price || promotion.offer_price) && (
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-2">Precio Especial</p>
                          <div className="flex items-center justify-center gap-4">
                            {promotion.original_price && promotion.offer_price && (
                              <>
                                <div>
                                  <p className="text-xs text-slate-500 line-through mb-1">
                                    Precio Original
                                  </p>
                                  <p className="text-2xl font-bold text-slate-400 line-through">
                                    ${promotion.original_price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-4xl font-bold text-cyan-600">
                                  →
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">
                                    Precio de Oferta
                                  </p>
                                  <p className="text-4xl font-bold text-cyan-600">
                                    ${promotion.offer_price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="ml-4">
                                  <span className="inline-block bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                                    {Math.round(((promotion.original_price - promotion.offer_price) / promotion.original_price) * 100)}% OFF
                                  </span>
                                </div>
                              </>
                            )}
                            {promotion.offer_price && !promotion.original_price && (
                              <div>
                                <p className="text-xs text-slate-600 mb-1">
                                  Precio
                                </p>
                                <p className="text-4xl font-bold text-cyan-600">
                                  ${promotion.offer_price.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Description */}
                    <div className="prose max-w-none">
                      <p className="text-slate-700 whitespace-pre-line">
                        {promotion.description}
                      </p>
                    </div>

                    {/* Images - Principal y adicionales */}
                    <div className="space-y-4">
                      {/* Imagen Principal */}
                      {promotion.image_url && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={promotion.image_url}
                            alt={promotion.title}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Imágenes Adicionales */}
                      {promotionImages[promotion.id] && promotionImages[promotion.id].length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {promotionImages[promotion.id].map((img) => (
                            <div key={img.id} className="rounded-lg overflow-hidden">
                              <img
                                src={img.image_url}
                                alt={`${promotion.title} - Imagen ${img.sort_order}`}
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video */}
                    {videoEmbedUrl && (
                      <div className="rounded-lg overflow-hidden bg-slate-900 aspect-video">
                        <iframe
                          src={videoEmbedUrl}
                          title={promotion.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

