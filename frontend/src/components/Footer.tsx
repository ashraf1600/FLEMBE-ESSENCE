import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Truck, ShieldAlert } from 'lucide-react';

// Inline SVG social icons
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-off-black text-nude border-t border-rose-smoke/20 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_10%_0%,rgba(216,167,177,0.12),transparent_28%),radial-gradient(circle_at_90%_100%,rgba(75,29,63,0.55),transparent_34%)]" />
      {/* Top Value Banner */}
      <div className="relative border-b border-white/10 bg-off-black-light/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <Truck size={22} className="text-rose-smoke flex-shrink-0" />
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-nude">Cash on Delivery</p>
              <p className="font-body text-[11px] text-nude/60">Dhaka & Cox's Bazar delivery coverage</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <MapPin size={22} className="text-rose-smoke flex-shrink-0" />
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-nude">Campus Free Delivery</p>
              <p className="font-body text-[11px] text-nude/60">DIU Main Campus, Prime Univ & Mirpur 1</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <ShieldAlert size={22} className="text-rose-smoke flex-shrink-0" />
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-nude">Doorstep Inspection</p>
              <p className="font-body text-[11px] text-nude/60">Verify items before accepting your delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Story */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-rose-smoke/40 flex items-center justify-center bg-burgundy/40">
                <span className="font-display text-rose-smoke text-sm font-bold">F</span>
              </div>
              <div>
                <span className="font-display text-2xl text-nude tracking-widest">FLEMBE</span>
                <span className="font-display text-2xl text-rose-smoke tracking-widest ml-1 font-semibold">ESSENCE</span>
              </div>
            </Link>
            
            <p className="font-body text-xs text-nude/70 leading-relaxed">
              Real products. Honest service. Your satisfaction matters.
              Handcrafted, affordable and stylish jewellery designed for university students and young women.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/share/19bb8cxwHW/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#1877F2] text-nude/70 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-gradient-to-tr hover:from-purple-500 hover:to-pink-500 text-nude/70 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="tel:01865330801"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-emerald-600 text-nude/70 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Call or WhatsApp"
              >
                <Phone size={16} />
              </a>
              <span className="font-body text-xs text-nude/60 pl-1">01865330801</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-body text-xs tracking-[0.18em] uppercase text-rose-smoke font-semibold">
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/shop', label: 'All Jewellery' },
                { to: '/categories', label: 'Categories' },
                { to: '/about', label: 'Our Story' },
                { to: '/contact', label: 'Contact Us' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="font-body text-xs text-nude/70 hover:text-rose-smoke transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Free Delivery Campus Hubs */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-body text-xs tracking-[0.18em] uppercase text-rose-smoke font-semibold">
              Free Delivery Zones
            </h4>
            <ul className="space-y-1.5 font-body text-xs text-nude/70">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>DIU Main Campus</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Prime University</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Mirpur 1</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Mazar Road & Lalkhuti</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Gabtoli Road</span>
              </li>
            </ul>
          </div>

          {/* Policies & Disclaimer */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-body text-xs tracking-[0.18em] uppercase text-rose-smoke font-semibold">
              Store Policies
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/delivery', label: 'Delivery Areas & Rates' },
                { to: '/return-exchange', label: 'No Return / No Exchange Policy' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="font-body text-xs text-nude/70 hover:text-rose-smoke transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-3 rounded bg-white/5 border border-white/10 mt-3">
              <p className="font-body text-[11px] text-nude/80 leading-normal">
                ⚠️ <strong className="text-rose-smoke">No Return / No Exchange.</strong><br />
                Please verify all items at delivery before paying the delivery agent.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-body text-nude/40">
          <p>© {new Date().getFullYear()} Flembe Essence. Real products. Honest service.</p>
          <div className="flex items-center gap-4">
            <span>Cash on Delivery · Dhaka & Cox's Bazar</span>
            <span>·</span>
            <Link to="/admin-login" className="text-nude/40 hover:text-rose-smoke transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
