import React from 'react';

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
