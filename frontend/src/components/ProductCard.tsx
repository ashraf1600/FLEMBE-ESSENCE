import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { ProductListItem } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Props {
  product: ProductListItem;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const isInStock = product.stock_status === 'IN_STOCK';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isInStock) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const [imgError, setImgError] = React.useState(false);
  const imageUrl = product.primary_image?.url || product.primary_image?.image_url || '';

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card-hover bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-nude/40">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.primary_image?.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-nude">
              <span className="font-display text-burgundy/20 text-5xl">F</span>
            </div>
          )}
          {/* Stock badge */}
          <div className="absolute top-2 left-2">
            {isInStock ? (
              <span className="badge-in-stock">In Stock</span>
            ) : (
              <span className="badge-out-of-stock">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="font-body text-xs tracking-widest uppercase text-rose-smoke mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-display text-lg text-off-black leading-snug mb-2 line-clamp-2 group-hover:text-burgundy transition-colors">
            {product.name}
          </h3>
          <p className="font-body text-burgundy font-semibold text-base mb-3">
            ৳{parseFloat(product.price).toLocaleString()}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`w-full flex items-center justify-center gap-2 py-2.5 font-body text-xs tracking-widest uppercase transition-all duration-200 ${
              isInStock
                ? 'bg-burgundy text-nude hover:bg-burgundy-light'
                : 'bg-nude-dark text-off-black/40 cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={14} />
            {isInStock ? 'Order Now' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
