// src/components/ProductCard.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, X } from 'lucide-react';
import type { ProductListItem } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

interface Props {
  product: ProductListItem;
}

/** Show urgency hint when only a few pieces remain */
const LOW_STOCK_THRESHOLD = 5;

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isInStock = product.stock_status === 'IN_STOCK';
  const lowStock = isInStock && product.stock_quantity <= LOW_STOCK_THRESHOLD;
  const imageUrl = product.primary_image?.url || product.primary_image?.image_url || '';
  const detailUrl = `/products/${product.slug}`;

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to your bag!`);
    navigate('/checkout');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleQuickViewAdd = () => {
    if (!isInStock) return;
    addToCart(product, 1);
    setQuickViewOpen(false);
    toast.success(`${product.name} added to your bag!`);
  };

  // Close quick-view with the Escape key
  React.useEffect(() => {
    if (!quickViewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [quickViewOpen]);

  return (
    <>
      <article className="group relative h-full bg-white rounded-xl overflow-hidden border border-nude-dark/35 shadow-sm hover:shadow-2xl hover:shadow-burgundy/12 transition-all duration-500 flex flex-col hover:-translate-y-1.5">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-nude/30">
          <Link to={detailUrl} aria-label={`View ${product.name}`} className="absolute inset-0">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt={product.primary_image?.alt_text || product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-nude/40 to-nude/80">
                <span className="font-display text-burgundy/30 text-5xl">FE</span>
                <span className="text-[10px] tracking-widest uppercase text-burgundy/40 mt-1 font-body">Flembe Essence</span>
              </span>
            )}
          </Link>

          {/* Soft gradient overlay on hover for legibility of icons */}
          <div className="absolute inset-0 bg-gradient-to-t from-off-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Stock badge */}
          <div className="absolute top-3 left-3 z-10">
            {isInStock ? (
              <span className="badge-in-stock shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Stock
              </span>
            ) : (
              <span className="badge-out-of-stock shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist + Quick View — always visible on mobile, fade-in on desktop hover */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 sm:opacity-0 sm:translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-200 ${
                isWishlisted
                  ? 'bg-rose-smoke text-off-black'
                  : 'bg-white/90 text-off-black hover:bg-rose-smoke hover:text-off-black'
              }`}
            >
              <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
              className="w-9 h-9 rounded-full bg-white/90 text-off-black hover:bg-burgundy hover:text-nude flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-200"
            >
              <Eye size={15} />
            </button>
          </div>

          {/* Material pill */}
          {product.material && (
            <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-[9px] uppercase tracking-wider font-body bg-off-black/80 text-nude px-2 py-0.5 rounded-full backdrop-blur-xs">
                {product.material}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            {product.category && (
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-rose-smoke font-bold mb-1.5">
                {product.category.name}
              </p>
            )}
            <h3 className="font-body text-sm sm:text-[15px] font-semibold tracking-[-0.01em] text-off-black leading-[1.3] mb-1.5 line-clamp-2 group-hover:text-burgundy transition-colors duration-200">
              <Link to={detailUrl}>{product.name}</Link>
            </h3>
          </div>

          <div className="pt-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-body text-burgundy font-bold text-xl">
                ৳{parseFloat(product.price).toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-off-black/40 font-body">COD</span>
            </div>
            <p className={`font-body text-[11px] font-semibold mb-2.5 ${lowStock ? 'text-burgundy' : 'text-transparent'} select-none`} aria-live="polite">
              {lowStock ? `Only ${product.stock_quantity} left — order soon` : '·'}
            </p>

            <button
              onClick={handleOrderNow}
              disabled={!isInStock}
              className={`w-full flex items-center justify-center gap-1.5 py-3 px-3 rounded-lg font-body text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-200 shadow-xs ${
                isInStock
                  ? 'bg-burgundy text-nude hover:bg-burgundy-light hover:shadow-md'
                  : 'bg-nude-dark text-off-black/40 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={14} />
              <span>{isInStock ? 'Order Now' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Quick View Modal (rendered via portal so it isn't clipped by card overflow) */}
      {quickViewOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-off-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setQuickViewOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view ${product.name}`}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl grid sm:grid-cols-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] sm:aspect-square bg-nude/30 sm:sticky sm:top-0">
              {imageUrl && !imgError ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-burgundy/30 text-6xl">FE</span>
                </div>
              )}
              <button
                onClick={() => setQuickViewOpen(false)}
                aria-label="Close quick view"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-off-black hover:bg-off-black hover:text-nude transition-colors sm:hidden"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col relative">
              <button
                onClick={() => setQuickViewOpen(false)}
                aria-label="Close quick view"
                className="hidden sm:flex absolute top-4 right-4 w-8 h-8 rounded-full bg-nude/40 items-center justify-center text-off-black hover:bg-off-black hover:text-nude transition-colors"
              >
                <X size={16} />
              </button>

              {product.category && (
                <p className="font-body text-[10px] tracking-[0.18em] uppercase text-rose-smoke font-semibold mb-2">
                  {product.category.name}
                </p>
              )}
              <h2 className="font-display text-2xl text-burgundy leading-snug mb-2">
                {product.name}
              </h2>
              {product.material && (
                <p className="font-body text-xs text-off-black/60 mb-4">Material: {product.material}</p>
              )}

              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-body text-burgundy font-semibold text-2xl">
                  ৳{parseFloat(product.price).toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-off-black/40 font-body">Cash on Delivery</span>
              </div>

              <div className="mb-6">
                {isInStock ? (
                  <span className="badge-in-stock">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {lowStock ? `Only ${product.stock_quantity} left` : 'In Stock'}
                  </span>
                ) : (
                  <span className="badge-out-of-stock">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-2.5">
                <button
                  onClick={handleQuickViewAdd}
                  disabled={!isInStock}
                  className={`btn-primary w-full rounded-lg ${!isInStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <ShoppingBag size={15} />
                  <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                <Link
                  to={detailUrl}
                  onClick={() => setQuickViewOpen(false)}
                  className="btn-outline w-full rounded-lg"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductCard;
