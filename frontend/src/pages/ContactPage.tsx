import React from 'react';
import { Phone, MapPin } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);


const ContactPage: React.FC = () => (
  <>
    <title>Contact Us — Flembe Essence</title>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="section-subtitle">Get in Touch</p>
        <h1 className="section-title">Contact Us</h1>
        <p className="font-body text-sm text-off-black/60 mt-4">
          Have a question? We're happy to help. Reach us on social media or by phone.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact cards */}
        <div className="space-y-5">
          {[
            {
              icon: <Phone size={20} />,
              title: 'Phone',
              value: '01865330801',
              href: 'tel:01865330801',
              linkText: 'Call Us',
              desc: 'Available during business hours. We\'ll respond as soon as possible.',
            },
            {
              icon: <FacebookIcon />,
              title: 'Facebook',
              value: 'Flembe Essence',
              href: 'https://www.facebook.com/share/19bb8cxwHW/',
              linkText: 'Message on Facebook',
              desc: 'Send us a message on Facebook for quick responses.',
            },
            {
              icon: <InstagramIcon />,
              title: 'Instagram',
              value: '@_flembe_._essence_',
              href: 'https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn',
              linkText: 'Follow on Instagram',
              desc: 'Follow us for new arrivals and updates.',
            },
            {
              icon: <MapPin size={20} />,
              title: 'Where to Find Us',
              value: 'Daffodil International University',
              href: null,
              linkText: null,
              desc: 'We occasionally set up stalls at DIU and other universities in Dhaka.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-burgundy/10 rounded-full flex items-center justify-center text-burgundy flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-body text-xs tracking-widest uppercase text-off-black/40 mb-0.5">{item.title}</p>
                <p className="font-body text-sm font-medium text-off-black mb-1">{item.value}</p>
                <p className="font-body text-xs text-off-black/50 mb-2">{item.desc}</p>
                {item.href && (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-body text-xs text-burgundy hover:text-burgundy-light underline"
                  >
                    {item.linkText} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Map / Info */}
        <div className="bg-burgundy p-10 text-nude flex flex-col justify-center">
          <h2 className="font-display text-2xl mb-4">Flembe Essence</h2>
          <p className="font-body text-sm text-nude/70 leading-relaxed mb-6">
            Real products. Honest service. Your satisfaction matters.
          </p>
          <p className="font-body text-sm text-nude/70 leading-relaxed">
            We're a small business run with care and commitment. Every order matters to us, and we strive
            to deliver the best experience with every purchase.
          </p>
          <div className="mt-8 border-t border-nude/20 pt-6">
            <p className="font-body text-xs text-nude/40 tracking-widest uppercase mb-2">Business Hours</p>
            <p className="font-body text-sm text-nude/70">Saturday – Thursday: 9 AM – 9 PM</p>
            <p className="font-body text-sm text-nude/70">Friday: 2 PM – 9 PM</p>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default ContactPage;
