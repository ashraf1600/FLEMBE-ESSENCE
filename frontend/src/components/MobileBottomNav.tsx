import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav: React.FC = () => {
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/shop', label: 'Shop', icon: Sparkles, end: false },
    { to: '/categories', label: 'Categories', icon: LayoutGrid, end: false },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: totalWishlist, end: false },
    { to: '/cart', label: 'Bag', icon: ShoppingBag, badge: totalItems, end: false },
    { to: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? 'Account' : 'Sign In', icon: User, end: false },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-burgundy/15 shadow-[0_-4px_25px_rgba(75,29,63,0.12)] px-2 py-1.5 transition-all"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-6 items-center justify-items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 select-none w-full ${
                  isActive
                    ? 'text-burgundy font-bold scale-105'
                    : 'text-off-black/60 hover:text-burgundy font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    <Icon
                      size={20}
                      className={`transition-transform duration-200 ${
                        isActive ? 'stroke-[2.5] text-burgundy' : 'stroke-[1.75]'
                      }`}
                    />
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-burgundy text-nude text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 shadow-xs border border-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 leading-none transition-colors truncate max-w-[48px] ${
                      isActive ? 'text-burgundy font-bold' : 'text-off-black/70'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-burgundy mt-0.5 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
