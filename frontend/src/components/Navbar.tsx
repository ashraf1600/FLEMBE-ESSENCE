import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, LayoutDashboard, Package, LogOut, User, Phone, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/',          label: 'Home' },
    { to: '/shop',      label: 'Shop' },
    { to: '/categories',label: 'Categories' },
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

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* ─── Top Announcement Bar ─── */}
      <div className="bg-burgundy text-nude text-[11px] font-body py-1.5 px-4 border-b border-rose-smoke/20 tracking-wider">
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
            <span className="text-rose-smoke/90 uppercase tracking-widest text-[10px]">Real Products · Honest Service</span>
          </div>
        </div>
      </div>

      {/* ─── Main Navigation Bar ─── */}
      <div className="bg-off-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-full border border-rose-smoke/40 flex items-center justify-center bg-burgundy/40 group-hover:border-rose-smoke transition-colors">
                <span className="font-display text-rose-smoke text-sm font-bold">F</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-display text-xl text-nude tracking-widest">FLEMBE</span>
                  <span className="font-display text-xl text-rose-smoke tracking-widest ml-1 font-semibold">ESSENCE</span>
                </div>
                <span className="text-[8px] uppercase tracking-[0.25em] text-nude/50 -mt-1 font-body">Jewellery & Accessories</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `font-body text-xs tracking-widest uppercase transition-all duration-200 py-1 relative ${
                      isActive
                        ? 'text-rose-smoke font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-rose-smoke'
                        : 'text-nude/80 hover:text-rose-smoke'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Desktop search */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jewellery..."
                  className="bg-off-black-light/80 border border-nude/20 rounded-full text-nude placeholder-nude/40 text-xs pl-3 pr-8 py-1.5 w-36 focus:w-48 focus:outline-none focus:border-rose-smoke transition-all duration-300"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2.5 text-nude/50 hover:text-rose-smoke transition-colors"
                >
                  <Search size={13} />
                </button>
              </form>

              {/* Cart */}
              <Link
                to="/checkout"
                className="relative p-2 text-nude hover:text-rose-smoke transition-colors rounded-full hover:bg-white/5"
                title="Your Bag / Checkout"
              >
                <ShoppingBag size={20} />
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
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="font-body text-[11px] uppercase tracking-widest text-nude/90 hover:text-rose-smoke transition-colors px-2.5 py-1"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="font-body text-[11px] uppercase tracking-widest bg-rose-smoke text-off-black font-semibold hover:bg-rose-smoke-light transition-all px-3 py-1 rounded-sm shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden text-nude hover:text-rose-smoke p-1.5 transition-colors"
                aria-label="Toggle menu"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden bg-off-black border-t border-nude/10 px-4 pb-6 pt-2 shadow-2xl animate-fade-in">
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
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-body text-sm tracking-widest uppercase py-2.5 px-2 rounded transition-colors ${
                    isActive ? 'text-rose-smoke bg-white/5 font-semibold' : 'text-nude hover:text-rose-smoke'
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
                      className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-rose-smoke py-2 px-2 rounded bg-burgundy/40"
                    >
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="w-full text-left flex items-center gap-2 font-body text-xs uppercase tracking-widest text-red-300 py-2 px-2 rounded hover:bg-white/5"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center bg-transparent border border-nude/30 text-nude py-2.5 text-xs uppercase tracking-wider font-body rounded"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center bg-rose-smoke text-off-black font-semibold py-2.5 text-xs uppercase tracking-wider font-body rounded"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
