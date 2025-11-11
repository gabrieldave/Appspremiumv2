import { Check } from 'lucide-react';

type PricingProps = {
  onSubscribe: () => void;
};

const features = [
  'Acceso a todas las aplicaciones premium',
  'Sistema MT4 portal de actualizaciones',
  'Suscripción Telegram de señales de noticias',
  'Soporte VIP por WhatsApp 24/7',
  'Videos tutoriales y guías',
  'Sin compromisos, cancela cuando quieras',
];

export function Pricing({ onSubscribe }: PricingProps) {
  return (
    <section id="precios" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Precio Simple y Transparente
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Una sola suscripción, acceso completo a todo. Sin tarifas ocultas ni sorpresas.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-cyan-400">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-center">
              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                Plan Premium
              </span>
            </div>

            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl sm:text-6xl font-bold text-white">$20</span>
                  <div className="text-left">
                    <div className="text-slate-400 text-sm">USD</div>
                    <div className="text-slate-400 text-sm">/ mes</div>
                  </div>
                </div>
                <p className="text-slate-400 mt-2">Facturado mensualmente</p>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-200 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onSubscribe}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Comenzar Ahora
              </button>

              <p className="text-center text-slate-400 text-sm mt-6">
                Garantía de devolución de 7 días. Cancela en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
