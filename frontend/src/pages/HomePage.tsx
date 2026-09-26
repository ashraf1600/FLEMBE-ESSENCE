// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, ShieldCheck, HeartHandshake, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const heroImages = [
    '/images/hero-jewellery.jpg',
    ...(categories?.flatMap(category => [category, ...(category.children || [])]) || [])
      .map(category => category.image || '')
      .filter(Boolean),
  ];
  const [heroSlide, setHeroSlide] = React.useState(0);

  React.useEffect(() => {
    if (heroImages.length < 2) return;
    const timer = window.setInterval(() => {
      setHeroSlide(current => (current + 1) % heroImages.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  return (
    <>
      <title>Flembe Essence — Affordable Style, Made for You</title>

      <section className="relative isolate min-h-[calc(100svh-114px)] flex items-center bg-burgundy-dark text-nude overflow-hidden">
        {heroImages.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-in-out ${index === heroSlide % heroImages.length ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(46,17,39,0.94)_0%,rgba(46,17,39,0.75)_38%,rgba(46,17,39,0.32)_72%,rgba(46,17,39,0.58)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-dark/80 via-transparent to-burgundy-dark/20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
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

            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm animate-float-slow">
                <div className="ml-auto max-w-[250px] bg-off-black/35 backdrop-blur-xl border border-nude/25 p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-2 h-2 rounded-full bg-rose-smoke shadow-[0_0_12px_rgba(216,167,177,0.8)]" />
                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-nude/80">The Flembe edit</span>
                  </div>
                  <p className="font-display text-2xl sm:text-3xl text-nude leading-tight">Little details.<br /><em className="text-rose-smoke">Big feeling.</em></p>
                  <p className="font-body text-xs text-nude/70 leading-relaxed mt-4">Everyday jewellery, thoughtfully chosen for your next chapter.</p>
                  <Link to="/shop" className="inline-flex items-center gap-2 mt-6 font-body text-[10px] uppercase tracking-[0.18em] text-nude border-b border-rose-smoke pb-1 hover:text-rose-smoke transition-colors">
                    Explore the edit <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="flex items-center justify-end gap-2 mt-6" aria-label="Hero slides">
                  {heroImages.slice(0, 5).map((_, index) => (
                    <span key={index} className={`h-1 rounded-full transition-all duration-500 ${index === heroSlide % Math.min(heroImages.length, 5) ? 'w-8 bg-rose-smoke' : 'w-2 bg-nude/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white border-b border-nude-dark/40 py-8">
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

      <section className="relative py-10 sm:py-12 bg-nude/30 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 sm:mb-8">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-rose-smoke mb-2">Just landed</p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-burgundy">New arrivals</h2>
              <p className="font-body text-xs sm:text-sm font-medium text-off-black/60 mt-3">Fresh pieces. Ready to glow.</p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-burgundy font-bold border-b-2 border-burgundy/40 pb-2 hover:text-burgundy-light hover:border-burgundy transition-colors self-start md:self-auto"
            >
              Shop all <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Curating the latest pieces..." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredData?.results.slice(0, 4).map(product => {
                const imageUrl = product.primary_image?.url || product.primary_image?.image_url || '';
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group relative overflow-hidden bg-white border border-nude-dark/30 shadow-sm hover:shadow-2xl hover:shadow-burgundy/15 transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-nude/30">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.primary_image?.alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nude/40 to-nude/80">
                          <span className="font-display text-5xl text-burgundy/25">FE</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-off-black/75 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <p className="font-body text-[9px] uppercase tracking-[0.18em] text-rose-smoke mb-1">
                          {product.category?.name || 'New piece'}
                        </p>
                        <h3 className="font-display text-lg sm:text-xl text-nude leading-tight line-clamp-2">{product.name}</h3>
                        <p className="font-body text-sm text-nude/90 mt-1">৳{parseFloat(product.price).toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-nude/30">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="mb-7 sm:mb-8">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-rose-smoke mb-2">
              Curated collections
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-burgundy">
              Shop by Category
            </h2>
            <p className="font-body text-xs sm:text-sm font-medium text-off-black/60 mt-3">
              Find your signature style.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {subCategories.length > 0 ? subCategories.slice(0, 4).map(cat => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-burgundy/20 transition-all duration-500"
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
                  <h3 className="font-display text-xl sm:text-2xl text-nude leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            )) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/60 rounded-2xl animate-pulse" />
              ))
            )}
          </div>

        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 sm:mb-8">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-rose-smoke mb-2">
                Handpicked Selection
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-burgundy">
                Featured Products
              </h2>
              <p className="font-body text-xs sm:text-sm font-medium text-off-black/60 mt-3">
                Curated pieces. Made to stand out.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-burgundy font-bold border-b-2 border-burgundy/40 pb-2 hover:text-burgundy-light hover:border-burgundy transition-colors self-start md:self-auto"
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