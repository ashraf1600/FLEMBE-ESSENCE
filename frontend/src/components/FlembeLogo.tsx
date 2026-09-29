import React from 'react';

export interface FlembeLogoProps {
  /**
   * 'full': Complete portrait animated SVG with silhouette, brand cursive, floating petals, and light sweeps
   * 'crest' | 'icon': Circular avatar frame for navbars and compact headers
   */
  variant?: 'full' | 'crest' | 'icon';
  /**
   * Size presets ('xs' | 'sm' | 'md' | 'lg' | 'xl') or numerical height in px
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  animated?: boolean;
  className?: string;
  alt?: string;
  showSubtitle?: boolean;
}

const HEIGHT_MAP = {
  xs: 38,
  sm: 52,
  md: 96,
  lg: 140,
  xl: 200,
};

export const FlembeLogo: React.FC<FlembeLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  alt = 'Flembe Essence logo',
}) => {
  const height = typeof size === 'number' ? size : HEIGHT_MAP[size] || 96;
  const LOGO_SRC = '/images/flembe-essence-logo-animated.svg';

  // Circular emblem / avatar for navigation bars & compact headers
  if (variant === 'crest' || variant === 'icon') {
    const iconDimension =
      typeof size === 'number'
        ? size
        : size === 'xs'
        ? 34
        : size === 'sm'
        ? 44
        : size === 'md'
        ? 52
        : size === 'lg'
        ? 72
        : 90;

    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden border-2 border-rose-smoke/60 bg-burgundy/40 shadow-[0_2px_14px_rgba(75,29,63,0.3)] group transition-all duration-300 hover:scale-105 hover:border-rose-smoke flex-shrink-0 ${className}`}
        style={{ width: iconDimension, height: iconDimension }}
      >
        <img
          src={LOGO_SRC}
          alt={alt}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          loading="eager"
        />
      </div>
    );
  }

  // Full portrait animated SVG artwork (with all light sweeps, petals, floating animations)
  return (
    <div className={`relative inline-flex flex-col items-center justify-center group ${className}`}>
      <img
        src={LOGO_SRC}
        alt={alt}
        className="w-auto object-contain filter drop-shadow-[0_8px_24px_rgba(75,29,63,0.25)] transition-transform duration-500 group-hover:scale-105"
        style={{ height }}
        loading="eager"
      />
    </div>
  );
};

export default FlembeLogo;
