import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, Shield, Heart, Phone } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../lib/queries';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/UI';

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
      {/* SEO */}
      <title>Flembe Essence — Affordable Jewellery & Fashion Accessories</title>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-burgundy overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-smoke blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-nude blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-rose-smoke mb-4">
              Flembe Essence
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-nude leading-tight mb-6">
              Affordable Style,<br />
              <span className="text-rose-smoke">Made for You</span>
            </h1>
            <p className="font-body text-nude/70 text-base leading-relaxed mb-8 max-w-md">
              Discover elegant jewellery and fashion accessories crafted for students and young women.
              Real products. Honest prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary bg-nude text-burgundy hover:bg-nude-dark">
                Shop Now
              </Link>
              <Link to="/categories" className="btn-outline border-nude/40 text-nude hover:bg-nude/10 hover:border-nude">
                Browse Categories
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-nude/10">
              <div className="text-center">
                <p className="font-display text-3xl text-nude">50+</p>
                <p className="font-body text-xs text-nude/50 tracking-widest uppercase">Products</p>
              </div>
              <div className="w-px h-10 bg-nude/10" />
              <div className="text-center">
                <p className="font-display text-3xl text-nude">COD</p>
                <p className="font-body text-xs text-nude/50 tracking-widest uppercase">Payment</p>
              </div>
              <div className="w-px h-10 bg-nude/10" />
              <div className="text-center">
                <p className="font-display text-3xl text-nude">Free</p>
                <p className="font-body text-xs text-nude/50 tracking-widest uppercase">Delivery*</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 bg-rose-smoke/20 rounded-full" />
              <div className="absolute inset-6 bg-nude/10 rounded-full flex items-center justify-center">
                <span className="font-display text-8xl text-nude/30">F</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-nude">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-subtitle">Explore</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {subCategories.length > 0 ? subCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group bg-white p-6 text-center card-hover hover:bg-burgundy transition-colors duration-300 shadow-sm"
              >
                <div className="w-12 h-12 bg-nude-dark rounded-full mx-auto mb-3 flex items-center justify-center group-hover:bg-nude/20 transition-colors">
                  <span className="font-display text-lg text-burgundy group-hover:text-nude">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <p className="font-body text-xs tracking-widest uppercase text-off-black group-hover:text-nude transition-colors">
                  {cat.name}
                </p>
              </Link>
            )) : (
              // Skeleton placeholders
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 text-center animate-pulse">
                  <div className="w-12 h-12 bg-nude-dark rounded-full mx-auto mb-3" />
                  <div className="h-3 bg-nude-dark rounded mx-auto w-16" />
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-8">
            <Link to="/categories" className="btn-outline">
              View All Categories <ArrowRight size={14} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-subtitle">Curated for You</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          {isLoading ? (
            <LoadingSpinner message="Loading products..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredData?.results.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/shop" className="btn-primary">
              View All Products <ArrowRight size={14} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Brand Values ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-nude">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-subtitle">Why Choose Us</p>
            <h2 className="section-title">Our Promise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart size={28} />,
                title: 'Handpicked Style',
                desc: 'Every piece is chosen for elegance and affordability. Perfect for students and young women.',
              },
              {
                icon: <Truck size={28} />,
                title: 'Free Delivery Available',
                desc: 'Free delivery to Daffodil International University, Prime University, Mirpur 1, and more.',
              },
              {
                icon: <Shield size={28} />,
                title: 'Honest Service',
                desc: 'What you see is what you get. No hidden charges. Cash on Delivery for your convenience.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 text-center shadow-sm">
                <div className="w-14 h-14 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4 text-burgundy">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl text-burgundy mb-3">{item.title}</h3>
                <p className="font-body text-sm text-off-black/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Delivery Info Banner ─────────────────────────────────────────── */}
      <section className="py-12 bg-burgundy text-nude">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Truck size={24} className="mx-auto mb-3 text-rose-smoke" />
          <h3 className="font-display text-2xl mb-2">Cash on Delivery · Dhaka & Cox's Bazar</h3>
          <p className="font-body text-sm text-nude/70 mb-4">
            Free delivery to selected areas. Check delivery info for details.
          </p>
          <Link to="/delivery" className="btn-outline border-nude/40 text-nude hover:bg-nude/10">
            View Delivery Areas
          </Link>
        </div>
      </section>

      {/* ─── Social / Contact ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-subtitle">Connect With Us</p>
          <h2 className="section-title">Find Us on Social Media</h2>
          <p className="font-body text-sm text-off-black/60 mb-8 max-w-md mx-auto">
            Follow us on Facebook and Instagram to see new arrivals, stall updates, and exclusive offers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.facebook.com/share/19bb8cxwHW/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 btn-primary bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
            >
              <FacebookIcon size={16} /> Facebook
            </a>
            <a
              href="https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
            >
              <InstagramIcon size={16} /> Instagram
            </a>
            <a
              href="tel:01865330801"
              className="flex items-center gap-2 btn-outline"
            >
              <Phone size={16} /> 01865330801
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
