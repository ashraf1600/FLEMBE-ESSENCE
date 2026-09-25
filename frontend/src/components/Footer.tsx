import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

// Inline SVG social icons (lucide-react doesn't export Facebook/Instagram)
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
    <footer className="bg-off-black text-nude mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/">
              <span className="font-display text-2xl text-nude tracking-widest">FLEMBE</span>
              <span className="font-display text-2xl text-rose-smoke tracking-widest ml-1">ESSENCE</span>
            </Link>
            <p className="font-body text-sm text-nude/60 mt-3 leading-relaxed max-w-sm">
              Real products. Honest service. Your satisfaction matters.
              Affordable and stylish jewellery for every occasion.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://www.facebook.com/share/19bb8cxwHW/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nude/60 hover:text-rose-smoke transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nude/60 hover:text-rose-smoke transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="tel:01865330801"
                className="text-nude/60 hover:text-rose-smoke transition-colors"
                aria-label="Phone"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase text-nude/40 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/shop', label: 'Shop' },
                { to: '/categories', label: 'Categories' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="font-body text-sm text-nude/60 hover:text-rose-smoke transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase text-nude/40 mb-4">Policies</h4>
            <ul className="space-y-2">
              {[
                { to: '/delivery', label: 'Delivery Info' },
                { to: '/return-exchange', label: 'Return & Exchange' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="font-body text-sm text-nude/60 hover:text-rose-smoke transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="font-body text-xs text-nude/40 mt-6 leading-relaxed">
              ⚠️ <span className="text-rose-smoke/80">No Return / No Exchange.</span><br />
              Please check your order upon delivery.
            </p>
          </div>
        </div>

        <div className="border-t border-nude/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-nude/30">
            © {new Date().getFullYear()} Flembe Essence. All rights reserved.
          </p>
          <p className="font-body text-xs text-nude/30">
            Cash on Delivery only · Available in Dhaka & Cox's Bazar
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
