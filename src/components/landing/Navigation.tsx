import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type NavigationProps = {
  onGetStarted: () => void;
};

export function Navigation({ onGetStarted }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // WhatsApp de soporte
  const supportWhatsApp = 'https://wa.me/5215645530082';

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
            <a
              href={supportWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-cyan-600 font-medium transition-colors"
            >
              Soporte
            </a>
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
              <a
                href={supportWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 hover:text-cyan-600 font-medium transition-colors px-2 py-2"
              >
                Soporte
              </a>
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

