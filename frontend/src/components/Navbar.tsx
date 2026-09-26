// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Menu, X, Search, LayoutDashboard, Package, LogOut, User, Phone, Sparkles, Heart, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../lib/queries';
import AuthDrawer from './AuthDrawer';

const WISHLIST_KEY = 'flembe_wishlist_ids';

function getWishlistCount(): number {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as number[]).length : 0;
  } catch {
    return 0;
  }
}

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const subCategories = categories?.flatMap(c => c.children || []).filter(c => c.is_active) || [];

  useEffect(() => {
    setWishlistCount(getWishlistCount());
    const sync = () => setWishlistCount(getWishlistCount());
    window.addEventListener('wishlist-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('wishlist-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const navLinks = [
    { to: '/',          label: 'Home' },
    { to: '/about',     label: 'About' },
    { to: '/delivery',  label: 'Delivery' },
    { to: '/contact',   label: 'Contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setOpen(false);
    }
  };

  const openMega = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setMegaOpen(true);
  };
  const closeMegaDelayed = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 shadow-[0_12px_35px_rgba(46,17,39,0.18)]">
      {/* ─── Top Announcement Bar ─── */}
      <div className="bg-burgundy text-nude text-[11px] font-body py-2 px-4 border-b border-rose-smoke/20 tracking-wider">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0 truncate">
            <Sparkles size={12} className="text-rose-smoke flex-shrink-0 animate-pulse" />
            <span className="truncate">
              <strong className="font-semibold text-rose-smoke">Free Delivery</strong> at DIU Main Campus, Prime Univ & Mirpur 1 · <span className="opacity-90">Cash on Delivery</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <a
              href="tel:01865330801"
              className="flex items-center gap-1 text-nude/80 hover:text-rose-smoke transition-colors"
            >
              <Phone size={11} />
              <span>01865330801</span>
            </a>
            <span className="text-nude/30">|</span>
            <span className="text-rose-smoke/90 uppercase tracking-widest text-[10px] font-semibold">Real Products · Honest Service</span>
          </div>
        </div>
      </div>

      {/* ─── Main Navigation Bar ─── */}
      <div className="bg-off-black/90 backdrop-blur-xl border-b border-rose-smoke/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-20 py-3">
            {/* Logo — bigger, bolder */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0 mr-auto md:mr-5 lg:mr-8">
              <div className="w-11 h-11 rounded-full border border-rose-smoke/50 flex items-center justify-center bg-burgundy/50 shadow-[0_0_24px_rgba(216,167,177,0.12)] group-hover:border-rose-smoke group-hover:scale-105 transition-all duration-300">
                <span className="font-display text-rose-smoke text-lg font-bold">F</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-display text-2xl sm:text-3xl text-nude tracking-widest leading-none">FLEMBE</span>
                  <span className="font-display text-2xl sm:text-3xl text-rose-smoke tracking-widest ml-1.5 font-semibold leading-none">ESSENCE</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-nude/50 mt-1 font-body">Jewellery & Accessories</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-5 shrink-0">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `font-body text-[13px] font-semibold tracking-widest uppercase transition-all duration-200 py-1 relative ${
                    isActive
                      ? 'text-rose-smoke after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-smoke'
                      : 'text-nude/85 hover:text-rose-smoke'
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `font-body text-[13px] font-semibold tracking-widest uppercase transition-all duration-200 py-1 relative ${
                    isActive
                      ? 'text-rose-smoke after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-smoke'
                      : 'text-nude/85 hover:text-rose-smoke'
                  }`
                }
              >
                Shop
              </NavLink>

              {/* ─── Categories Mega Menu Trigger ─── */}
              <div
                className="relative"
                onMouseEnter={openMega}
                onMouseLeave={closeMegaDelayed}
              >
                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `flex items-center gap-1 font-body text-[13px] font-semibold tracking-widest uppercase transition-all duration-200 py-1 relative ${
                      isActive || megaOpen
                        ? 'text-rose-smoke after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-smoke'
                        : 'text-nude/85 hover:text-rose-smoke'
                    }`
                  }
                >
                  <span>Categories</span>
                  <ChevronDown size={13} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180 text-rose-smoke' : ''}`} />
                </NavLink>

                {/* Mega Menu Panel */}
                {megaOpen && subCategories.length > 0 && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[92vw] max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_70px_rgba(46,17,39,0.2)] border border-nude-dark/30 p-6 animate-fade-in z-50"
                    onMouseEnter={openMega}
                    onMouseLeave={closeMegaDelayed}
                  >
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-nude-dark/20">
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-rose-smoke font-semibold">Explore</p>
                        <h3 className="font-display text-xl text-burgundy">Shop by Category</h3>
                      </div>
                      <Link
                        to="/categories"
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-1 font-body text-[11px] uppercase tracking-wider text-burgundy font-semibold hover:text-burgundy-light transition-colors"
                      >
                        View All <ArrowRight size={13} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {subCategories.slice(0, 8).map(cat => (
                        <Link
                          key={cat.id}
                          to={`/categories/${cat.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-burgundy to-rose-smoke/60 flex items-center justify-center">
                              <span className="font-display text-nude/30 text-3xl">{cat.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-off-black/80 via-transparent to-transparent group-hover:from-off-black/90 transition-all duration-300" />
                          <span className="absolute bottom-2 left-2 right-2 font-body text-[11px] font-semibold text-nude leading-tight">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {navLinks.slice(1).map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `font-body text-[13px] font-semibold tracking-widest uppercase transition-all duration-200 py-1 relative ${
                      isActive
                        ? 'text-rose-smoke after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-smoke'
                        : 'text-nude/85 hover:text-rose-smoke'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop search */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-44 xl:w-48 focus-within:w-56 transition-[width] duration-300 shrink-0 ml-3 xl:ml-5">
                <Search size={15} className="absolute left-3.5 text-rose-smoke/70 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jewellery..."
                  className="w-full bg-white/[0.07] border border-rose-smoke/35 rounded-full text-nude placeholder-nude/45 text-xs pl-10 pr-10 py-2.5 outline-none focus:bg-white/10 focus:border-rose-smoke focus:shadow-[0_0_0_3px_rgba(216,167,177,0.12)] transition-all duration-300"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-nude/60 hover:text-off-black hover:bg-rose-smoke transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </form>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 text-nude hover:text-rose-smoke transition-colors rounded-full hover:bg-white/5"
                title="Your Wishlist"
              >
                <Heart size={21} className={wishlistCount > 0 ? 'fill-rose-smoke text-rose-smoke' : ''} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-smoke text-off-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-body shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-nude hover:text-rose-smoke transition-colors rounded-full hover:bg-white/5"
                title="Your Bag"
              >
                <ShoppingBag size={21} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-smoke text-off-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-body shadow-sm animate-scale">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Actions (Desktop) */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-1.5 font-body text-[11px] uppercase tracking-wider text-nude/90 hover:text-rose-smoke transition-colors px-2 py-1 rounded hover:bg-white/5"
                    title="My Orders"
                  >
                    <Package size={14} className="text-rose-smoke" />
                    <span>Orders</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin-dashboard"
                      className="flex items-center gap-1.5 bg-burgundy/90 text-nude font-body text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded-sm hover:bg-burgundy transition-all border border-rose-smoke/30 shadow-xs"
                    >
                      <LayoutDashboard size={12} className="text-rose-smoke" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                    <Link
                      to="/profile"
                      className="font-body text-xs text-rose-smoke hover:text-nude font-medium truncate max-w-[130px] transition-colors flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5"
                      title={`View Profile (${user?.name || user?.username})`}
                    >
                      <User size={13} className="flex-shrink-0" />
                      <span className="truncate">{user?.first_name || user?.name || user?.username}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="text-nude/40 hover:text-red-300 transition-colors p-1 rounded hover:bg-white/5"
                      title="Sign Out"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-body text-[12px] font-semibold uppercase tracking-widest text-nude/90 hover:text-rose-smoke transition-colors px-2.5 py-2"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="font-body text-[12px] font-bold uppercase tracking-widest bg-rose-smoke text-off-black hover:bg-nude transition-all px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden text-nude hover:text-rose-smoke p-1.5 transition-colors"
                aria-label="Toggle menu"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden bg-off-black/95 backdrop-blur-xl border-t border-nude/10 px-4 pb-6 pt-2 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-2 py-3 border-b border-nude/10">
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-off-black-light border border-nude/20 rounded text-nude placeholder-nude/40 text-sm px-3 py-2 focus:outline-none focus:border-rose-smoke"
            />
            <button type="submit" className="text-nude bg-burgundy px-3.5 py-2 rounded">
              <Search size={15} />
            </button>
          </form>

          <nav className="flex flex-col gap-1 pt-3">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-body text-sm font-semibold tracking-widest uppercase py-2.5 px-2 rounded transition-colors ${
                  isActive ? 'text-rose-smoke bg-white/5' : 'text-nude hover:text-rose-smoke'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/shop"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-body text-sm font-semibold tracking-widest uppercase py-2.5 px-2 rounded transition-colors ${
                  isActive ? 'text-rose-smoke bg-white/5' : 'text-nude hover:text-rose-smoke'
                }`
              }
            >
              Shop
            </NavLink>

            {/* Mobile Categories accordion */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="w-full flex items-center justify-between font-body text-sm font-semibold tracking-widest uppercase py-2.5 px-2 rounded text-nude hover:text-rose-smoke transition-colors"
              >
                <span>Categories</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCategoriesOpen && (
                <div className="grid grid-cols-2 gap-2 px-2 py-2 animate-fade-in">
                  {subCategories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      onClick={() => { setOpen(false); setMobileCategoriesOpen(false); }}
                      className="font-body text-xs text-nude/80 hover:text-rose-smoke py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    to="/categories"
                    onClick={() => setOpen(false)}
                    className="font-body text-xs text-rose-smoke font-semibold py-1.5 px-2 col-span-2"
                  >
                    View All Categories &rarr;
                  </Link>
                </div>
              )}
            </div>

            <NavLink
              to="/cart"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between font-body text-sm font-semibold tracking-widest uppercase py-2.5 px-2 rounded transition-colors ${
                  isActive ? 'text-rose-smoke bg-white/5' : 'text-nude hover:text-rose-smoke'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-rose-smoke" />
                <span>Shopping Bag</span>
              </div>
              {totalItems > 0 && (
                <span className="bg-rose-smoke text-off-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between font-body text-sm font-semibold tracking-widest uppercase py-2.5 px-2 rounded transition-colors ${
                  isActive ? 'text-rose-smoke bg-white/5' : 'text-nude hover:text-rose-smoke'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-smoke" />
                <span>Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-rose-smoke text-off-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </NavLink>

            {navLinks.slice(1).map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-body text-sm font-semibold tracking-widest uppercase py-2.5 px-2 rounded transition-colors ${
                    isActive ? 'text-rose-smoke bg-white/5' : 'text-nude hover:text-rose-smoke'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile user links */}
            <div className="border-t border-nude/10 pt-3 mt-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-rose-smoke py-2 px-2 rounded hover:bg-white/5"
                  >
                    <User size={16} /> My Profile ({user?.first_name || user?.name || user?.username})
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-nude hover:text-rose-smoke py-2 px-2 rounded hover:bg-white/5"
                  >
                    <Package size={16} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-rose-smoke py-2 px-2 rounded hover:bg-white/5"
                    >
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="w-full flex items-center gap-2 font-body text-sm uppercase tracking-widest text-red-300 py-2 px-2 rounded hover:bg-white/5"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setAuthMode('login'); }}
                    className="text-center font-body text-sm font-semibold uppercase tracking-widest text-nude border border-nude/30 py-2.5 rounded-full hover:border-rose-smoke hover:text-rose-smoke transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setAuthMode('register'); }}
                    className="text-center font-body text-sm font-bold uppercase tracking-widest bg-rose-smoke text-off-black py-2.5 rounded-full shadow-md"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {authMode && (
        <AuthDrawer
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </header>
  );
};

export default Navbar;