import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos Rodríguez',
    role: 'Trader Profesional',
    content: 'Las herramientas son excepcionales. He mejorado significativamente mi análisis técnico y la atención al cliente es de primera clase.',
    rating: 5,
  },
  {
    name: 'María González',
    role: 'Inversionista',
    content: 'La mejor inversión que he hecho en mi carrera de trading. El soporte VIP me ha ayudado a resolver todas mis dudas al instante.',
    rating: 5,
  },
  {
    name: 'Juan Martínez',
    role: 'Day Trader',
    content: 'Increíble colección de aplicaciones. Siempre están actualizadas y funcionan perfectamente. Vale cada centavo de la suscripción.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Miles de traders confían en nosotros para potenciar sus operaciones diarias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              <div className="border-t border-slate-200 pt-4">
                <div className="font-semibold text-slate-900">{testimonial.name}</div>
                <div className="text-sm text-slate-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
