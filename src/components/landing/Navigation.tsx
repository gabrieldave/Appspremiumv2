import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { supabase, type SocialMediaLink } from '../../lib/supabase';
import * as LucideIcons from 'lucide-react';

type NavigationProps = {
  onGetStarted: () => void;
};

export function Navigation({ onGetStarted }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error loading social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    try {
      const IconComponent = (LucideIcons as any)[iconName];
      if (IconComponent && typeof IconComponent === 'function') {
        return IconComponent;
      }
    } catch (error) {
      console.warn(`Icono "${iconName}" no encontrado, usando Share2 por defecto`);
    }
    return LucideIcons.Share2;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg"
              alt="Todos Somos Traders"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Social Media Links */}
            {!loading && socialLinks.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-200">
                {socialLinks.slice(0, 4).map((link) => {
                  const Icon = getIcon(link.icon_name);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-cyan-600 transition-colors"
                      aria-label={link.platform}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}

            <a
              href="#beneficios"
              className="text-slate-700 hover:text-cyan-600 font-medium transition-colors"
            >
              Beneficios
            </a>
            <a
              href="#precios"
              className="text-slate-700 hover:text-cyan-600 font-medium transition-colors"
            >
              Precios
            </a>
            <a
              href="#promociones"
              className="text-slate-700 hover:text-cyan-600 font-medium transition-colors"
            >
              Promociones
            </a>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Comenzar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 hover:text-cyan-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-4">
              {/* Social Media Links Mobile */}
              {!loading && socialLinks.length > 0 && (
                <div className="flex items-center gap-4 px-2 py-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Redes Sociales:</span>
                  <div className="flex items-center gap-3">
                    {socialLinks.map((link) => {
                      const Icon = getIcon(link.icon_name);
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-cyan-600 transition-colors"
                          aria-label={link.platform}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <a
                href="#beneficios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 hover:text-cyan-600 font-medium transition-colors px-2 py-2"
              >
                Beneficios
              </a>
              <a
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 hover:text-cyan-600 font-medium transition-colors px-2 py-2"
              >
                Precios
              </a>
              <a
                href="#promociones"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 hover:text-cyan-600 font-medium transition-colors px-2 py-2"
              >
                Promociones
              </a>
              <button
                onClick={() => {
                  onGetStarted();
                  setMobileMenuOpen(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all text-left"
              >
                Comenzar
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

