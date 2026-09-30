import React, { useState } from 'react';
import { X } from 'lucide-react';

const WhatsAppIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.86.514 3.638 1.442 5.17L2 22l4.965-1.417a10.03 10.03 0 0 0 5.039 1.348c5.526 0 10.004-4.478 10.004-10.004C22.008 6.478 17.53 2 12.004 2zm0 18.184a8.13 8.13 0 0 1-4.36-1.267l-.312-.185-2.98.851.865-2.951-.203-.32a8.13 8.13 0 0 1-1.256-4.308c0-4.506 3.667-8.172 8.246-8.172 4.505 0 8.171 3.666 8.171 8.172 0 4.506-3.666 8.18-8.171 8.18z"/>
  </svg>
);

export const WhatsAppConcierge: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const WHATSAPP_URL =
    "https://wa.me/8801865330801?text=Hi%20Flembe%20Essence!%20I'd%20like%20to%20know%20more%20about%20your%20jewellery%20collection.";

  return (
    <aside
      aria-label="Direct WhatsApp Support"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-end gap-2.5 no-print select-none"
    >
      {/* Interactive Tooltip bubble */}
      {!dismissed && showTooltip && (
        <div className="hidden sm:flex flex-col bg-white border border-nude-dark rounded-xl p-3 shadow-xl max-w-xs animate-fade-in relative text-left">
          <button
            onClick={() => setDismissed(true)}
            aria-label="Close tooltip"
            className="absolute top-2 right-2 text-off-black/40 hover:text-off-black"
          >
            <X size={13} />
          </button>
          <div className="flex items-center gap-1.5 mb-1 text-emerald-700 font-body text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Flembe Concierge Online</span>
          </div>
          <p className="font-body text-xs text-off-black/80 leading-relaxed">
            Need styling advice or have custom campus delivery queries? Chat directly with our store team!
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        aria-label="Chat with Flembe Essence on WhatsApp"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="sr-only">Chat on WhatsApp (01865330801)</span>
        <WhatsAppIcon size={26} />

        {/* Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none group-hover:hidden" />

        {/* Active online green dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />
      </a>
    </aside>
  );
};

export default WhatsAppConcierge;
