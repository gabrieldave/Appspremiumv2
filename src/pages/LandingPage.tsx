import { useState } from 'react';
import { Navigation } from '../components/landing/Navigation';
import { Hero } from '../components/landing/Hero';
import { Benefits } from '../components/landing/Benefits';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { Promotions } from '../components/landing/Promotions';
import { Footer } from '../components/landing/Footer';
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
      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
