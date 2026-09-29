import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-8 h-8 border-2 border-nude-dark border-t-burgundy rounded-full animate-spin" />
    <p className="font-body text-xs tracking-widest uppercase text-off-black/40">{message}</p>
  </div>
);

export const EmptyState: React.FC<{ message?: string; children?: React.ReactNode }> = ({
  message = 'No items found.',
  children,
}) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="w-16 h-16 rounded-full bg-nude-dark flex items-center justify-center">
      <span className="font-display text-2xl text-burgundy/30">F</span>
    </div>
    <p className="font-body text-sm text-off-black/40">{message}</p>
    {children}
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <p className="font-body text-sm text-red-500">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-outline text-sm">
        Try Again
      </button>
    )}
  </div>
);

export const StockBadge: React.FC<{ status: 'IN_STOCK' | 'OUT_OF_STOCK' }> = ({ status }) =>
  status === 'IN_STOCK' ? (
    <span className="badge-in-stock">● In Stock</span>
  ) : (
    <span className="badge-out-of-stock">● Out of Stock</span>
  );

export const PriceDisplay: React.FC<{ price: string | number; className?: string }> = ({ price, className = '' }) => (
  <span className={`font-display text-2xl text-burgundy ${className}`}>
    ৳{parseFloat(String(price)).toLocaleString()}
  </span>
);

export interface Crumb {
  label: string;
  to?: string;
}

/** Shared breadcrumb trail: Home / Shop / Category / Product */
export const Breadcrumbs: React.FC<{ items: Crumb[]; className?: string }> = ({ items, className = '' }) => (
  <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs font-body text-off-black/55 ${className}`}>
    <Link to="/" className="hover:text-burgundy transition-colors">Home</Link>
    {items.map((item, i) => (
      <React.Fragment key={`${item.label}-${i}`}>
        <ChevronRight size={12} className="text-off-black/30 flex-shrink-0" aria-hidden="true" />
        {item.to && i < items.length - 1 ? (
          <Link to={item.to} className="hover:text-burgundy transition-colors whitespace-nowrap">
            {item.label}
          </Link>
        ) : (
          <span aria-current="page" className="text-burgundy font-medium truncate max-w-[220px]">
            {item.label}
          </span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

/** Shimmering product-card placeholder used while grids load */
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-nude-dark/35 shadow-sm flex flex-col h-full" aria-hidden="true">
    <div className="skeleton aspect-[4/5]" />
    <div className="p-4 sm:p-5 space-y-2.5">
      <div className="skeleton h-2.5 w-1/3 rounded-full" />
      <div className="skeleton h-3.5 w-11/12 rounded-full" />
      <div className="skeleton h-3.5 w-2/3 rounded-full" />
      <div className="skeleton h-6 w-1/2 rounded-full" />
      <div className="skeleton h-11 w-full rounded-lg" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5',
}) => (
  <div className={className} role="status" aria-label="Loading products">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/** Consistent eyebrow + title + subtitle + optional action link for page sections */
export const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
}> = ({ eyebrow, title, subtitle, actionLabel, actionTo }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7 sm:mb-8">
    <div>
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-rose-smoke mb-2">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-none text-burgundy">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-xs sm:text-sm font-medium text-off-black/60 mt-3">{subtitle}</p>
      )}
    </div>
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-burgundy font-bold border-b-2 border-burgundy/40 pb-2 hover:text-burgundy-light hover:border-burgundy transition-colors self-start md:self-auto"
      >
        {actionLabel} <ArrowRight size={14} />
      </Link>
    )}
  </div>
);
