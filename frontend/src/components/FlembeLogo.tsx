import React from 'react';

export interface FlembeLogoProps {
  /**
   * 'crest': Circular animated medallion with original logo image + rotating orbit + sparkles
   * 'full': Medallion with brand typography underneath
   * 'simple': Clean original logo with subtle animation glow
   */
  variant?: 'crest' | 'full' | 'simple';
  /**
   * Preset sizes or number in pixels
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  animated?: boolean;
  className?: string;
  showSubtitle?: boolean;
}

const SIZE_MAP = {
  xs: 36,
  sm: 48,
  md: 68,
  lg: 96,
  xl: 140,
};

export const FlembeLogo: React.FC<FlembeLogoProps> = ({
  variant = 'crest',
  size = 'md',
  animated = true,
  className = '',
  showSubtitle = true,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 68;
  const imgSize = Math.round(pixelSize * 0.76);

  // ── Standalone Simple Animated Logo ──────────────────────────────────────────
  if (variant === 'simple') {
    return (
      <div
        className={`relative inline-flex items-center justify-center group flex-shrink-0 ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Soft breathing background aura */}
        {animated && (
          <div
            className="absolute inset-0 rounded-full bg-rose-smoke/25 blur-md pointer-events-none"
            style={{ animation: 'feBreath 3.5s ease-in-out infinite alternate' }}
          />
        )}
        <img
          src="/images/logo.png"
          alt="Flembe Essence"
          className="relative z-10 w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  // ── Crest / Medallion with Animated Orbit & Sparkles ───────────────────────
  const renderCrest = () => (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 group select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* 1. Pulsing Soft Aura */}
      {animated && (
        <div
          className="absolute inset-[-6%] rounded-full bg-radial from-rose-smoke/30 via-burgundy/15 to-transparent blur-md pointer-events-none"
          style={{ animation: 'feBreath 4s ease-in-out infinite alternate' }}
        />
      )}

      {/* 2. SVG Rotating Luxury Orbit & Border */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      >
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#D8A7B1"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />

        {/* Rotating Dashed Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#E8D9C1"
          strokeWidth="1.4"
          strokeDasharray="4 8 1 8"
          strokeOpacity="0.75"
          style={animated ? { animation: 'feSpin 26s linear infinite', transformOrigin: 'center' } : {}}
        />

        {/* Inner Border */}
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke="#D8A7B1"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />

        {/* Sparkle 1 (Top Right) */}
        {animated && (
          <g
            transform="translate(86, 16)"
            style={{ animation: 'feTwinkle 2.6s ease-in-out infinite alternate', transformOrigin: 'center' }}
          >
            <path d="M0 -5 Q0 0 5 0 Q0 0 0 5 Q0 0 -5 0 Q0 0 0 -5 Z" fill="#ffffff" />
            <circle cx="0" cy="0" r="1" fill="#E8C4CB" />
          </g>
        )}

        {/* Sparkle 2 (Bottom Left) */}
        {animated && (
          <g
            transform="translate(14, 82)"
            style={{ animation: 'feTwinkle 3.2s ease-in-out infinite alternate 1s', transformOrigin: 'center' }}
          >
            <path d="M0 -4 Q0 0 4 0 Q0 0 0 4 Q0 0 -4 0 Q0 0 0 -4 Z" fill="#D8A7B1" />
          </g>
        )}
      </svg>

      {/* 3. Original Image Medallion */}
      <div
        className="relative z-10 rounded-full overflow-hidden bg-burgundy/25 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
        style={{
          width: imgSize,
          height: imgSize,
          boxShadow: '0 4px 18px rgba(75, 29, 63, 0.28)',
          border: '1.5px solid rgba(216, 167, 177, 0.65)',
        }}
      >
        <img
          src="/images/logo.png"
          alt="Flembe Essence"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );

  // ── Full Lockup: Crest + Brand Typography ─────────────────────────────────
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {renderCrest()}

        <div className="mt-3.5 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className="font-display font-bold tracking-[0.22em] text-burgundy transition-colors duration-300"
              style={{ fontSize: Math.max(pixelSize * 0.26, 20) }}
            >
              FLEMBE
            </span>
            <span
              className="font-display font-semibold tracking-[0.22em] text-rose-smoke transition-colors duration-300"
              style={{ fontSize: Math.max(pixelSize * 0.26, 20) }}
            >
              ESSENCE
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center gap-2 mt-1">
              <span className="h-px w-4 bg-rose-smoke/40" />
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.28em] uppercase text-off-black/60 font-semibold">
                Jewellery &amp; Accessories
              </span>
              <span className="h-px w-4 bg-rose-smoke/40" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: crest
  return renderCrest();
};

export default FlembeLogo;
