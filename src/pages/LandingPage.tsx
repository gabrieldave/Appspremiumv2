import { useState } from 'react';
import { Navigation } from '../components/landing/Navigation';
import { Hero } from '../components/landing/Hero';
import { Benefits } from '../components/landing/Benefits';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { Promotions } from '../components/landing/Promotions';
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
      <Navigation onGetStarted={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <Benefits />
      <Testimonials />
      <Promotions />
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
