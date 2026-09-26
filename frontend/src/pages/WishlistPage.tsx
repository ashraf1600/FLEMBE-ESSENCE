import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag, ArrowLeft, Sparkles, Trash2 } from 'lucide-react';
import { fetchProducts } from '../lib/queries';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/UI';
import toast from 'react-hot-toast';

const WishlistPage: React.FC = () => {
  const { wishlistIds, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist-products', wishlistIds],
    queryFn: () => fetchProducts({ ids: wishlistIds.join(',') }),
    enabled: wishlistIds.length > 0,
  });

  const products = data?.results || [];

  const handleClearWishlist = () => {
    if (window.confirm('Clear all saved items from your wishlist?')) {
      clearWishlist();
    }
  };

  const handleMoveAllToCart = () => {
    const inStock = products.filter(p => p.stock_status === 'IN_STOCK');
    if (inStock.length === 0) {
      toast.error('No in-stock items available to add to cart.');
      return;
    }
    inStock.forEach(p => addToCart(p, 1));
    toast.success(`Added ${inStock.length} items to your shopping bag!`, {
      style: {
        background: '#4B1D3F',
        color: '#E8D9C1',
      },
    });
  };

  if (wishlistIds.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-[70vh] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white border border-nude-dark/40 rounded-2xl p-8 sm:p-12 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-smoke/15 flex items-center justify-center mb-6 border border-rose-smoke/30">
            <Heart size={36} className="text-rose-smoke stroke-[1.5]" />
          </div>
          <span className="font-body text-[11px] uppercase tracking-[0.25em] text-rose-smoke font-semibold block mb-2">
            Personal Collection
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-off-black mb-3">
            Your Wishlist is Empty
          </h1>
          <p className="font-body text-sm text-off-black/65 leading-relaxed mb-8">
            Tap the heart icon on any piece you adore to build your personal wishlist and review your favorites whenever you like.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="btn-primary">
              <Sparkles size={15} />
              <span>Discover Jewellery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-body text-off-black/50 mb-3">
            <Link to="/" className="hover:text-burgundy transition-colors">Home</Link>
            <span>/</span>
            <span className="text-burgundy font-medium">Wishlist</span>
          </nav>
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-nude-dark/40 pb-5">
            <div>
              <span className="font-body text-[11px] uppercase tracking-[0.25em] text-rose-smoke font-semibold block mb-1">
                Saved Favorites
              </span>
              <h1 className="font-display text-3xl sm:text-4xl text-off-black">
                My Wishlist
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body text-xs text-off-black/60 bg-white border border-nude-dark/40 px-3 py-1.5 rounded-full">
                {wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'}
              </span>
              <button
                onClick={handleMoveAllToCart}
                className="btn-primary text-xs py-2 px-4"
              >
                <ShoppingBag size={14} />
                <span>Add In-Stock to Bag</span>
              </button>
              <button
                onClick={handleClearWishlist}
                className="flex items-center gap-1.5 text-xs font-body text-off-black/50 hover:text-red-600 transition-colors p-2"
                title="Clear wishlist"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-nude-dark/40 p-8">
            <p className="font-body text-sm text-off-black/60 mb-4">
              The products saved in your wishlist are currently not available.
            </p>
            <Link to="/shop" className="btn-primary">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-widest text-burgundy font-semibold hover:text-burgundy-light transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Continue Browsing Catalogue</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
