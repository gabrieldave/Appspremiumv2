import { useState } from 'react';
import { Hero } from '../components/landing/Hero';
import { Benefits } from '../components/landing/Benefits';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { AuthModal } from '../components/auth/AuthModal';

export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleGetStarted = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSubscribe = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img
                src="https://vdgbqkokslhmzdvedimv.supabase.co/storage/v1/object/public/logos/Logo.jpg"
                alt="Todos Somos Traders"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#beneficios" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                Beneficios
              </a>
              <a href="#precios" className="text-slate-700 hover:text-cyan-600 font-medium transition-colors">
                Precios
              </a>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
              >
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </nav>
      <Hero onGetStarted={handleGetStarted} />
      <Benefits />
      <Testimonials />
      <Pricing onSubscribe={handleSubscribe} />

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Todos Somos Traders</h3>
            <p className="text-slate-400 mb-6">
              Portal Premium de Herramientas de Trading Profesional
            </p>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Todos Somos Traders. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
