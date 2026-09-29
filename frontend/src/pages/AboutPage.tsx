import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Users } from 'lucide-react';
import FlembeLogo from '../components/FlembeLogo';

const AboutPage: React.FC = () => (
  <>
    <title>About Us — Flembe Essence</title>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <p className="section-subtitle">Our Story</p>
        <h1 className="section-title">About Flembe Essence</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
        <div className="space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl text-burgundy mb-4 font-semibold">Who We Are</h2>
          <p className="font-body text-sm text-off-black/75 leading-relaxed mb-4">
            Flembe Essence is a small business founded by a young entrepreneur from Cox's Bazar, Bangladesh.
            We believe that every woman deserves to feel beautiful — without spending a fortune.
          </p>
          <p className="font-body text-sm text-off-black/75 leading-relaxed mb-4">
            We started selling jewellery and fashion accessories through Facebook, Instagram, and at
            stalls at Daffodil International University. Our products are carefully selected to offer
            style, quality, and affordability.
          </p>
          <p className="font-body text-sm text-off-black/75 leading-relaxed border-l-2 border-rose-smoke pl-4 italic">
            Our tagline says it all: <strong className="text-burgundy font-medium not-italic">Real products. Honest service. Your satisfaction matters.</strong>
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-burgundy via-burgundy-dark to-off-black rounded-2xl p-8 sm:p-10 text-center shadow-xl border border-rose-smoke/30 overflow-hidden flex flex-col items-center justify-center min-h-[320px] group">
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_20%,rgba(216,167,177,0.35),transparent_65%)]" />
          
          <Link
            to="/"
            className="relative z-10 flex flex-col items-center group-hover:scale-105 transition-transform duration-300"
            title="Flembe Essence — Home"
          >
            {/* The animated brand crest */}
            <FlembeLogo variant="crest" size={105} animated className="mb-5" />

            {/* FLEMBE ESSENCE Logo typography */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
              <span className="font-display text-2xl sm:text-3xl text-nude tracking-[0.22em] leading-none">FLEMBE</span>
              <span className="font-display text-2xl sm:text-3xl text-rose-smoke tracking-[0.22em] font-semibold leading-none">ESSENCE</span>
            </div>
            
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-nude/70 mt-2.5 font-body">
              Jewellery & Accessories
            </span>
          </Link>

          <div className="relative z-10 mt-6 pt-5 border-t border-rose-smoke/20 w-full max-w-xs">
            <p className="font-display text-base sm:text-lg text-nude/95 italic">
              Affordable Style, Made for You
            </p>
            <p className="font-body text-[10px] text-rose-smoke/80 tracking-widest uppercase mt-1">
              Real Products · Honest Service
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: <Heart size={24} />, title: 'Our Mission', text: 'Make stylish jewellery accessible to students and young women across Bangladesh.' },
          { icon: <MapPin size={24} />, title: 'Where We Are', text: "Based in Cox's Bazar, delivering across Dhaka and Cox's Bazar with COD." },
          { icon: <Users size={24} />, title: 'Our Community', text: "We're proud to serve the student community at Daffodil International University and beyond." },
        ].map((card, i) => (
          <div key={i} className="bg-nude p-6 text-center">
            <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-3 text-burgundy">
              {card.icon}
            </div>
            <h3 className="font-display text-lg text-burgundy mb-2">{card.title}</h3>
            <p className="font-body text-sm text-off-black/60 leading-relaxed">{card.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/shop" className="btn-primary mr-4">Browse Our Collection</Link>
        <Link to="/contact" className="btn-outline">Get in Touch</Link>
      </div>
    </div>
  </>
);

export default AboutPage;
