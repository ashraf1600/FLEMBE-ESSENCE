import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Users } from 'lucide-react';

const AboutPage: React.FC = () => (
  <>
    <title>About Us — Flembe Essence</title>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <p className="section-subtitle">Our Story</p>
        <h1 className="section-title">About Flembe Essence</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
        <div>
          <h2 className="font-display text-2xl text-burgundy mb-4">Who We Are</h2>
          <p className="font-body text-sm text-off-black/70 leading-relaxed mb-4">
            Flembe Essence is a small business founded by a young entrepreneur from Cox's Bazar, Bangladesh.
            We believe that every woman deserves to feel beautiful — without spending a fortune.
          </p>
          <p className="font-body text-sm text-off-black/70 leading-relaxed mb-4">
            We started selling jewellery and fashion accessories through Facebook, Instagram, and at
            stalls at Daffodil International University. Our products are carefully selected to offer
            style, quality, and affordability.
          </p>
          <p className="font-body text-sm text-off-black/70 leading-relaxed">
            Our tagline says it all: <em className="text-burgundy font-medium">Real products. Honest service. Your satisfaction matters.</em>
          </p>
        </div>
        <div className="bg-burgundy p-10 text-center">
          <span className="font-display text-8xl text-nude/20">F</span>
          <p className="font-display text-xl text-nude mt-4">Affordable Style,<br />Made for You</p>
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
