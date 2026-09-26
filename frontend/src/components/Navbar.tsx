import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, LayoutDashboard, Package, LogOut, User } from 'lucide-react';
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
    <header className="bg-off-black sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-2xl text-nude tracking-widest">FLEMBE</span>
            <span className="font-display text-2xl text-rose-smoke tracking-widest ml-1">ESSENCE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `font-body text-xs tracking-widest uppercase transition-colors ${
                    isActive ? 'text-rose-smoke' : 'text-nude hover:text-rose-smoke'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-off-black-light border-b border-nude/30 text-nude placeholder-nude/40 text-xs px-2 py-1 w-28 focus:w-36 focus:outline-none focus:border-rose-smoke transition-all"
              />
              <button type="submit" className="text-nude/60 hover:text-rose-smoke ml-1 transition-colors">
                <Search size={14} />
              </button>
            </form>

            {/* Cart */}
            <Link to="/checkout" className="relative text-nude hover:text-rose-smoke transition-colors" title="Checkout">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-smoke text-off-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Actions (Desktop) */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/my-orders"
                  className="flex items-center gap-1.5 font-body text-[11px] uppercase tracking-wider text-nude hover:text-rose-smoke transition-colors"
                  title="My Orders"
                >
                  <Package size={14} />
                  <span>Orders</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin-dashboard"
                    className="flex items-center gap-1 bg-burgundy text-nude font-body text-[10px] uppercase tracking-widest px-2.5 py-1.5 hover:bg-burgundy/80 transition-colors border border-rose-smoke/30"
                  >
                    <LayoutDashboard size={12} />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                  <Link
                    to="/profile"
                    className="font-body text-xs text-rose-smoke hover:text-nude font-medium truncate max-w-[130px] transition-colors flex items-center gap-1.5 py-1 px-1.5 hover:bg-white/5 rounded-xs"
                    title={`View Profile (${user?.name || user?.username})`}
                  >
                    <User size={13} className="flex-shrink-0" />
                    <span>{user?.first_name || user?.name || user?.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-nude/40 hover:text-rose-smoke transition-colors p-1"
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
                  className="font-body text-[11px] uppercase tracking-widest text-nude hover:text-rose-smoke transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="font-body text-[10px] uppercase tracking-widest bg-rose-smoke/20 text-rose-smoke hover:bg-rose-smoke hover:text-off-black transition-all px-2.5 py-1 rounded-xs border border-rose-smoke/40"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-nude hover:text-rose-smoke transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-off-black border-t border-nude/10 px-4 pb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 py-3 border-b border-nude/10">
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-off-black-light border border-nude/20 text-nude placeholder-nude/40 text-sm px-3 py-2 focus:outline-none"
            />
            <button type="submit" className="text-nude bg-burgundy px-3 py-2">
              <Search size={14} />
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
                  `font-body text-sm tracking-widest uppercase py-2 transition-colors ${
                    isActive ? 'text-rose-smoke' : 'text-nude hover:text-rose-smoke'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile user links */}
            <div className="border-t border-nude/10 pt-3 mt-2">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-rose-smoke py-1"
                  >
                    <User size={16} /> My Profile ({user?.first_name || user?.name || user?.username})
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-nude hover:text-rose-smoke py-1"
                  >
                    <Package size={16} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 font-body text-sm uppercase tracking-widest text-rose-smoke py-1"
                    >
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="flex items-center gap-2 font-body text-xs uppercase tracking-widest text-red-300 pt-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center bg-transparent border border-nude/30 text-nude py-2 text-xs uppercase tracking-wider font-body"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center bg-rose-smoke text-off-black font-semibold py-2 text-xs uppercase tracking-wider font-body"
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
