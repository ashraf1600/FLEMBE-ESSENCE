// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, ShieldCheck, HeartHandshake, Phone, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../lib/queries';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/UI';
import Testimonials from '../components/Testimonials';

// Inline social SVGs
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

const HomePage: React.FC = () => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['products', { ordering: '-created_at' }],
    queryFn: () => fetchProducts({ ordering: '-created_at', page: 1 }),
  });

  const subCategories = categories?.flatMap(c => c.children || []).filter(c => c.is_active).slice(0, 6) || [];

  return (
    <>
      <title>Flembe Essence — Affordable Style, Made for You</title>

      <section className="relative bg-gradient-to-b from-burgundy-dark via-burgundy to-burgundy text-nude overflow-hidden py-12 md:py-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-smoke/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nude/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="md:col-span-7 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-smoke/15 border border-rose-smoke/30 text-rose-smoke text-xs font-body uppercase tracking-[0.18em]">
                <Sparkles size={12} className="animate-pulse" />
                <span>Affordable & Stylish Jewellery</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-nude leading-[1.12] tracking-tight">
                Affordable Style,<br />
                <span className="text-rose-smoke font-medium italic">Made for You</span>
              </h1>

              <p className="font-body text-nude/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
                Discover handpicked rings, necklaces, earrings, and fashion accessories crafted for everyday glamour.
                Real products, honest service, and genuine satisfaction.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3.5 pt-2">
                <Link
                  to="/shop"
                  className="btn-primary bg-nude text-burgundy hover:bg-nude-dark font-semibold shadow-md px-7 py-3 text-xs tracking-widest rounded-xs"
                >
                  <span>Shop Collection</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/categories"
                  className="btn-outline border-nude/40 text-nude hover:bg-nude/15 hover:border-nude px-6 py-3 text-xs tracking-widest rounded-xs"
                >
                  Browse Categories
                </Link>
              </div>

              <div className="pt-6 border-t border-nude/15 grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-nude font-semibold">50+</p>
                  <p className="font-body text-[10px] sm:text-xs text-rose-smoke uppercase tracking-wider mt-0.5">Designs</p>
                </div>
                <div className="border-l border-nude/15 pl-4">
                  <p className="font-display text-2xl sm:text-3xl text-nude font-semibold">COD</p>
                  <p className="font-body text-[10px] sm:text-xs text-rose-smoke uppercase tracking-wider mt-0.5">Payment</p>
                </div>
                <div className="border-l border-nude/15 pl-4">
                  <p className="font-display text-2xl sm:text-3xl text-nude font-semibold">Free*</p>
                  <p className="font-body text-[10px] sm:text-xs text-rose-smoke uppercase tracking-wider mt-0.5">Campus Delivery</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-square">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-smoke/30 to-nude/20 transform rotate-2 scale-[1.02] border border-rose-smoke/30" />

                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-nude/30 bg-off-black">
                  <img
                    src="/images/hero-jewellery.jpg"
                    alt="Flembe Essence Jewellery Showcase"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-off-black/60 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5 animate-bounce-slow">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-body text-[11px] font-semibold text-off-black tracking-wide">100% Handpicked</span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-burgundy/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-rose-smoke/30 flex items-center gap-1.5">
                    <Truck size={13} className="text-rose-smoke" />
                    <span className="font-body text-[11px] font-medium text-nude tracking-wide">Fast COD Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-nude-dark/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 p-3">
              <div className="w-11 h-11 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center flex-shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-off-black">Cash on Delivery</h4>
                <p className="font-body text-xs text-off-black/60 mt-0.5">Pay only when you receive your order</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 p-3">
              <div className="w-11 h-11 rounded-full bg-rose-smoke/30 text-burgundy flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-off-black">Campus Free Delivery</h4>
                <p className="font-body text-xs text-off-black/60 mt-0.5">DIU, Prime Univ, Mirpur 1 & more</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 p-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-off-black">Transparent Service</h4>
                <p className="font-body text-xs text-off-black/60 mt-0.5">Inspect parcel right at delivery</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 p-3">
              <div className="w-11 h-11 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center flex-shrink-0">
                <HeartHandshake size={20} />
              </div>
              <div>
                <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-off-black">Direct Support</h4>
                <p className="font-body text-xs text-off-black/60 mt-0.5">Phone or WhatsApp: 01865330801</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-nude/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="section-subtitle">Curated Collections</p>
            <h2 className="section-title">Shop by Category</h2>
            <p className="font-body text-xs sm:text-sm text-off-black/60 mt-2">
              From everyday minimalist rings to timeless pearl necklaces, explore accessories designed to complement your personality.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {subCategories.length > 0 ? subCategories.slice(0, 4).map(cat => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-burgundy/20 transition-all duration-500"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-burgundy via-burgundy-light to-rose-smoke/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <span className="font-display text-nude/25 text-7xl select-none">{cat.name.charAt(0)}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-off-black/85 via-off-black/15 to-transparent group-hover:from-off-black/95 transition-all duration-500" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-display text-lg sm:text-xl text-nude leading-tight mb-1">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-widest text-rose-smoke opacity-70 group-hover:opacity-100 group-hover:gap-2 transition-all duration-300">
                    Explore Collection <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            )) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/60 rounded-2xl animate-pulse" />
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/categories"
              className="btn-outline border-burgundy text-burgundy hover:bg-burgundy hover:text-nude text-xs tracking-widest px-6 py-2.5 rounded-xs"
            >
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-nude-dark/30">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-rose-smoke font-semibold mb-1">
                Handpicked Selection
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-burgundy">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-4 sm:mt-0 font-body text-xs uppercase tracking-wider text-burgundy font-semibold hover:text-burgundy-light flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading handcrafted jewellery..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredData?.results.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="btn-primary px-8 py-3.5 text-xs tracking-widest shadow-md rounded-xs"
            >
              <span>Browse All Jewellery</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-nude/30 to-nude/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 sm:p-12 shadow-sm border border-nude-dark/40 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-rose-smoke font-semibold">
                Our Story & Mission
              </span>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-burgundy leading-snug">
                "Real products. Honest service. Your satisfaction matters."
              </h3>
              <p className="font-body text-sm text-off-black/70 leading-relaxed">
                Flembe Essence was born with a passion to bring chic, premium-feeling jewellery and accessories to students and fashion lovers without the luxury markup.
                From pop-up stalls at Daffodil International University to deliveries across Dhaka and Cox's Bazar, every order is packed with love and genuine care.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 font-body text-xs text-off-black/80">
                  <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                  <span>Honest product photos & accurate materials</span>
                </div>
                <div className="flex items-center gap-2 font-body text-xs text-off-black/80">
                  <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                  <span>Open parcel verification at doorstep</span>
                </div>
                <div className="flex items-center gap-2 font-body text-xs text-off-black/80">
                  <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                  <span>Free delivery to select student hubs</span>
                </div>
                <div className="flex items-center gap-2 font-body text-xs text-off-black/80">
                  <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                  <span>Friendly customer support on phone & WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-burgundy text-nude p-6 sm:p-8 rounded-sm text-center space-y-4 shadow-md">
              <Truck size={32} className="mx-auto text-rose-smoke" />
              <h4 className="font-display text-2xl text-nude">Cash on Delivery Available</h4>
              <p className="font-body text-xs text-nude/80 leading-relaxed">
                We deliver throughout Dhaka and Cox's Bazar. Check out our free delivery locations or calculate your zone rates instantly.
              </p>
              <Link
                to="/delivery"
                className="btn-outline border-nude text-nude hover:bg-nude hover:text-burgundy w-full py-2.5 text-xs rounded-xs font-semibold"
              >
                View Delivery Zones
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-nude-dark/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-rose-smoke font-semibold">
            Join Our Community
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-off-black">
            Connect With Flembe Essence
          </h2>
          <p className="font-body text-sm text-off-black/60 max-w-lg mx-auto">
            Stay updated with new arrivals, styling tips, university stall announcements, and exclusive deals on our socials.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <a
              href="https://www.facebook.com/share/19bb8cxwHW/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-body text-xs uppercase tracking-wider px-5 py-3 rounded-xs shadow-xs transition-transform hover:-translate-y-0.5"
            >
              <FacebookIcon size={16} />
              <span>Facebook Page</span>
            </a>
            <a
              href="https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-95 text-white font-body text-xs uppercase tracking-wider px-5 py-3 rounded-xs shadow-xs transition-transform hover:-translate-y-0.5"
            >
              <InstagramIcon size={16} />
              <span>Instagram Feed</span>
            </a>
            <a
              href="tel:01865330801"
              className="flex items-center gap-2 bg-off-black text-nude hover:bg-off-black-light font-body text-xs uppercase tracking-wider px-5 py-3 rounded-xs shadow-xs transition-transform hover:-translate-y-0.5"
            >
              <Phone size={14} className="text-rose-smoke" />
              <span>01865330801</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;