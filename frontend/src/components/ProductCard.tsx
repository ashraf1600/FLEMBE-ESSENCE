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
      <article className="group relative h-full bg-white/95 rounded-2xl overflow-hidden border border-nude-dark/45 shadow-[0_4px_24px_-6px_rgba(75,29,63,0.06)] hover:shadow-[0_24px_48px_-12px_rgba(75,29,63,0.18)] hover:border-rose-smoke/80 transition-all duration-500 flex flex-col hover:-translate-y-2">
        {/* Image Container with Luxury Framed Look */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-nude/25 to-nude/45">
          <Link to={detailUrl} aria-label={`View ${product.name}`} className="absolute inset-0">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt={product.primary_image?.alt_text || product.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-nude/40 via-rose-smoke/10 to-nude/80">
                <span className="font-display text-burgundy/30 text-5xl font-light">FE</span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-burgundy/50 mt-1 font-body">Flembe Essence</span>
              </span>
            )}
          </Link>

          {/* Soft ambient gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-off-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Luxury Floating Stock / Urgency Badge */}
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10">
            {isInStock ? (
              lowStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-rose-300/70 text-burgundy text-[9px] sm:text-[10px] font-body font-semibold tracking-wider uppercase shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-smoke animate-ping" />
                  Only {product.stock_quantity} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md border border-emerald-400/30 text-emerald-800 text-[9px] sm:text-[10px] font-body font-medium tracking-wider uppercase shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-red-300/50 text-red-700 text-[9px] sm:text-[10px] font-body font-medium tracking-wider uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Sold Out
              </span>
            )}
          </div>

          {/* Floating Glassmorphic Wishlist + Quick View */}
          <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 flex flex-col gap-1.5 sm:gap-2 sm:opacity-0 sm:translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/70 transition-all duration-200 ${
                isWishlisted
                  ? 'bg-rose-smoke text-burgundy border-rose-smoke scale-105'
                  : 'bg-white/85 text-off-black hover:bg-rose-smoke hover:text-burgundy hover:scale-105'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleQuickView}
              aria-label={`Quick view ${product.name}`}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/85 text-off-black hover:bg-burgundy hover:text-nude hover:scale-105 flex items-center justify-center shadow-lg backdrop-blur-md border border-white/70 transition-all duration-200"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Material Capsule */}
          {product.material && (
            <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-[9px] uppercase tracking-[0.16em] font-body bg-off-black/85 text-nude px-2.5 py-0.5 rounded-full backdrop-blur-md border border-nude/20">
                {product.material}
              </span>
            </div>
          )}
        </div>

        {/* Editorial Product Details */}
        <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between bg-gradient-to-b from-white to-nude/10">
          <div>
            {product.category && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1 h-1 rounded-full bg-rose-smoke" />
                <p className="font-body text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-rose-smoke font-bold">
                  {product.category.name}
                </p>
              </div>
            )}
            <h3 className="font-display text-[15px] sm:text-[18px] font-medium tracking-normal text-off-black leading-[1.3] mb-1 line-clamp-2 group-hover:text-burgundy transition-colors duration-300">
              <Link to={detailUrl}>{product.name}</Link>
            </h3>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-nude/40 mt-2">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xs text-burgundy/80 font-light">BDT</span>
                <span className="font-display text-burgundy font-semibold text-lg sm:text-2xl tracking-tight">
                  {parseFloat(product.price).toLocaleString()}
                </span>
              </div>
              <span className="text-[9px] tracking-[0.16em] uppercase text-off-black/45 font-body font-medium bg-nude/40 px-2 py-0.5 rounded-xs">
                COD
              </span>
            </div>

            <button
              onClick={handleOrderNow}
              disabled={!isInStock}
              className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-full font-body text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-300 shadow-sm ${
                isInStock
                  ? 'bg-burgundy text-nude hover:bg-burgundy-light hover:shadow-lg hover:shadow-burgundy/20 active:scale-[0.98]'
                  : 'bg-nude-dark/60 text-off-black/40 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
