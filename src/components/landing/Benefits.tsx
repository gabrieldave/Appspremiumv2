import { Download, Sparkles, Headphones, TrendingUp, Shield, Zap, Bell } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    title: 'Actualizaciones Continuas',
    description: 'Recibe todas las mejoras y nuevas funcionalidades automáticamente sin costo adicional.',
  },
  {
    icon: Download,
    title: 'Apps Premium Ilimitadas',
    description: 'Acceso completo a nuestra colección de herramientas profesionales de trading.',
  },
  {
    icon: Bell,
    title: 'Señales de Noticias Telegram',
    description: 'Acceso exclusivo a nuestro canal de Telegram con señales y análisis de noticias en tiempo real.',
  },
  {
    icon: Headphones,
    title: 'Soporte VIP Prioritario',
    description: 'Atención personalizada por WhatsApp y canales exclusivos las 24 horas del día.',
  },
  {
    icon: TrendingUp,
    title: 'Sistema MT4 Actualizado',
    description: 'Descarga siempre la última versión de nuestro sistema de trading optimizado.',
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'Todas las aplicaciones están verificadas y libres de malware o código malicioso.',
  },
  {
    icon: Zap,
    title: 'Instalación Rápida',
    description: 'Comienza a operar en minutos con nuestras guías paso a paso y videos tutoriales.',
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            ¿Por Qué Suscribirse?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Todo lo que necesitas para llevar tu trading al siguiente nivel está incluido en tu suscripción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group bg-slate-50 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:bg-white border border-slate-200 hover:border-cyan-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
