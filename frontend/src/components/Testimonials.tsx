// src/components/Testimonials.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

// TODO: Replace with real customer testimonials once collected (with their consent).
// Do NOT launch to real customers with placeholder reviews still in place.
const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Add Real Customer Name',
    role: 'Verified Buyer',
    quote: 'Replace this with an actual quote from a real customer who purchased and reviewed a product.',
    rating: 5,
  },
  {
    name: 'Add Real Customer Name',
    role: 'Verified Buyer',
    quote: 'Replace this with an actual quote from a real customer who purchased and reviewed a product.',
    rating: 5,
  },
  {
    name: 'Add Real Customer Name',
    role: 'Verified Buyer',
    quote: 'Replace this with an actual quote from a real customer who purchased and reviewed a product.',
    rating: 5,
  },
];

interface Props {
  testimonials?: Testimonial[];
}

const Testimonials: React.FC<Props> = ({ testimonials = PLACEHOLDER_TESTIMONIALS }) => {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-nude/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="section-subtitle">What Our Customers Say</p>
          <h2 className="section-title">Loved By Real Customers</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-nude-dark/30 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={15}
                    className={idx < t.rating ? 'text-amber-500 fill-amber-500' : 'text-nude-dark'}
                  />
                ))}
              </div>

              <p className="font-body text-sm text-off-black/80 leading-relaxed mb-6">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-nude-dark/20">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-burgundy font-semibold">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-off-black">{t.name}</p>
                  <p className="font-body text-xs text-off-black/50">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;