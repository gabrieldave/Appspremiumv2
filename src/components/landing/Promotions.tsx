import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Play, Image as ImageIcon } from 'lucide-react';
import { supabase, type Promotion } from '../../lib/supabase';

export function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
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
                      <p className="text-slate-600 line-clamp-2">
                        {promotion.description}
                      </p>
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
                    {/* Full Description */}
                    <div className="prose max-w-none">
                      <p className="text-slate-700 whitespace-pre-line">
                        {promotion.description}
                      </p>
                    </div>

                    {/* Image */}
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

