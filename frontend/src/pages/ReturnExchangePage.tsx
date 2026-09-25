import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckSquare } from 'lucide-react';

const ReturnExchangePage: React.FC = () => (
  <>
    <title>Return & Exchange Policy — Flembe Essence</title>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <p className="section-subtitle">Our Policy</p>
        <h1 className="section-title">Return & Exchange Policy</h1>
      </div>

      <div className="bg-red-50 border border-red-200 p-8 mb-8 text-center">
        <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
        <h2 className="font-display text-2xl text-red-700 mb-3">No Return / No Exchange</h2>
        <p className="font-body text-sm text-red-600 leading-relaxed max-w-xl mx-auto">
          All sales are final. We do not accept returns or exchanges for any products.
        </p>
      </div>

      <div className="bg-white p-8 shadow-sm mb-8 space-y-6">
        <div>
          <h3 className="font-display text-xl text-burgundy mb-3">Why This Policy?</h3>
          <p className="font-body text-sm text-off-black/70 leading-relaxed">
            As a small business, we carefully ensure the quality of every product before it is sent out.
            To keep our prices affordable for students and young customers, we cannot absorb the cost of
            returns and exchanges.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-burgundy mb-3">What You Should Do</h3>
          <ul className="space-y-3">
            {[
              'Check the product carefully as soon as it is delivered.',
              'If there is a visible issue, report it immediately to us via phone or social media.',
              'Take photos or videos as evidence before opening the packaging.',
              'Contact us at 01865330801 immediately after receiving the order.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 font-body text-sm text-off-black/70">
                <CheckSquare size={14} className="text-burgundy mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-xl text-burgundy mb-3">Before You Order</h3>
          <p className="font-body text-sm text-off-black/70 leading-relaxed">
            Please review product images, descriptions, and material details carefully before placing your order.
            If you have questions about a product, contact us on{' '}
            <a href="https://www.facebook.com/share/19bb8cxwHW/" target="_blank" rel="noopener noreferrer"
              className="text-burgundy hover:underline">Facebook</a>{' '}
            or{' '}
            <a href="https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn" target="_blank" rel="noopener noreferrer"
              className="text-burgundy hover:underline">Instagram</a>{' '}
            before purchasing.
          </p>
        </div>
      </div>

      <p className="font-body text-xs text-off-black/40 text-center mb-8">
        By placing an order, you confirm that you have read and accepted this policy.
      </p>

      <div className="text-center">
        <Link to="/shop" className="btn-primary mr-4">Browse Products</Link>
        <Link to="/contact" className="btn-outline">Contact Us</Link>
      </div>
    </div>
  </>
);

export default ReturnExchangePage;
