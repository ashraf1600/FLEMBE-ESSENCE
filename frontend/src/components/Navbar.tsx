import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/delivery', label: 'Delivery' },
    { to: '/contact', label: 'Contact' },
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
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-off-black-light border-b border-nude/30 text-nude placeholder-nude/40 text-xs px-2 py-1 w-32 focus:outline-none focus:border-rose-smoke transition-colors"
              />
              <button type="submit" className="text-nude/60 hover:text-rose-smoke ml-1 transition-colors">
                <Search size={14} />
              </button>
            </form>

            {/* Cart */}
            <Link to="/checkout" className="relative text-nude hover:text-rose-smoke transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-smoke text-off-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>

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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
