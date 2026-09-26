import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import type { ProductListItem } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Props {
  product: ProductListItem;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);
  const isInStock = product.stock_status === 'IN_STOCK';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isInStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#4B1D3F',
        color: '#E8D9C1',
        fontSize: '12px',
        fontFamily: 'Jost, sans-serif',
      },
      iconTheme: {
        primary: '#D8A7B1',
        secondary: '#4B1D3F',
      },
    });
    setTimeout(() => setJustAdded(false), 1500);
  };

  const [imgError, setImgError] = React.useState(false);
  const imageUrl = product.primary_image?.url || product.primary_image?.image_url || '';

  return (
    <Link to={`/products/${product.slug}`} className="group block h-full">
      <div className="bg-white rounded-sm overflow-hidden border border-nude-dark/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-nude/30">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.primary_image?.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-nude/40 to-nude/80">
              <span className="font-display text-burgundy/30 text-5xl">FE</span>
              <span className="text-[10px] tracking-widest uppercase text-burgundy/40 mt-1 font-body">Flembe Essence</span>
            </div>
          )}

          {/* Stock badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
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

          {/* Material pill if present */}
          {product.material && (
            <div className="absolute bottom-2 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[9px] uppercase tracking-wider font-body bg-off-black/80 text-nude px-2 py-0.5 rounded-full backdrop-blur-xs">
                {product.material}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {product.category && (
              <p className="font-body text-[10px] tracking-[0.18em] uppercase text-rose-smoke font-semibold mb-1">
                {product.category.name}
              </p>
            )}
            <h3 className="font-display text-base sm:text-lg text-off-black leading-snug mb-1 line-clamp-2 group-hover:text-burgundy transition-colors duration-200">
              {product.name}
            </h3>
          </div>

          <div className="pt-2">
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-body text-burgundy font-semibold text-lg">
                ৳{parseFloat(product.price).toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-off-black/40 font-body">COD</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xs font-body text-[11px] tracking-widest uppercase transition-all duration-200 shadow-xs ${
                justAdded
                  ? 'bg-emerald-700 text-white'
                  : isInStock
                  ? 'bg-burgundy text-nude hover:bg-burgundy-light hover:shadow-md'
                  : 'bg-nude-dark text-off-black/40 cursor-not-allowed'
              }`}
            >
              {justAdded ? (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>{isInStock ? 'Order Now' : 'Out of Stock'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
