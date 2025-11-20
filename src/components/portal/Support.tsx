import { useEffect, useState } from 'react';
import { MessageCircle, Loader2, ExternalLink, Star } from 'lucide-react';
import { supabase, SupportLink } from '../../lib/supabase';
import * as Icons from 'lucide-react';

export function Support() {
  const [links, setLinks] = useState<SupportLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || MessageCircle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  const featuredLink = links.find((link) => link.is_featured);
  const regularLinks = links.filter((link) => !link.is_featured);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Soporte VIP</h1>
        <p className="text-slate-600">
          Estamos aquí para ayudarte. Contáctanos a través de cualquiera de nuestros canales de soporte y redes sociales.
        </p>
      </div>

      {featuredLink && (
        <div className="mb-8">
          <a
            href={featuredLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {(() => {
                    const Icon = getIcon(featuredLink.icon_name);
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-white">
                      {featuredLink.platform}
                    </h3>
                    <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  </div>
                  <p className="text-green-100">
                    Soporte técnico // Ventas de cursos // Teléfono personal - Disponible 24/7
                  </p>
                </div>
              </div>
              <ExternalLink className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
            </div>
          </a>
        </div>
      )}

      {regularLinks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Canales de Comunidad y Redes Sociales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularLinks.map((link) => {
              const Icon = getIcon(link.icon_name);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-cyan-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {link.platform}
                  </h3>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {links.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Canales de soporte próximamente
          </h3>
          <p className="text-slate-600">
            Estamos configurando nuestros canales de soporte. Vuelve pronto.
          </p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-3">
          Horarios de Atención
        </h3>
        <div className="space-y-2 text-slate-700">
          <p>
            <span className="font-semibold">WhatsApp VIP:</span> Disponible 24/7
          </p>
          <p>
            <span className="font-semibold">Tiempo de respuesta:</span> Menos de 2 horas en horario laboral
          </p>
          <p>
            <span className="font-semibold">Idiomas:</span> Español
          </p>
        </div>
      </div>
    </div>
  );
}
