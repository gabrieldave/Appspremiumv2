import { ArrowRight } from 'lucide-react';

type HeroProps = {
  onGetStarted: () => void;
};

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoOHYtOGgtOHptMCA4djhoOHYtOGgtOHptLTggMHY4aDh2LThoLTh6bTAgOHY4aDh2LThoLTh6bS04LTh2OGg4di04aC04em0wIDh2OGg4di04aC04em04LTI0djhoOHYtOGgtOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Acceso Exclusivo a Herramientas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mt-2">
              de Trading Profesional
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Únete a la comunidad premium de traders y obtén acceso ilimitado a aplicaciones avanzadas,
            actualizaciones constantes y soporte VIP personalizado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              Suscribirse Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-slate-500 hover:border-slate-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:bg-slate-800/50"
            >
              Ver Precios
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">5+</div>
              <div className="text-slate-400">Apps Premium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-slate-400">Soporte VIP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">∞</div>
              <div className="text-slate-400">Actualizaciones</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
