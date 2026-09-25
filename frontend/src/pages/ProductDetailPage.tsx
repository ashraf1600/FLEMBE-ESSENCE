import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProductBySlug } from '../lib/queries';
import { useCart } from '../context/CartContext';
import { LoadingSpinner, ErrorState, StockBadge, PriceDisplay } from '../components/UI';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className="py-20"><LoadingSpinner /></div>;
  if (isError || !product) return <div className="py-20"><ErrorState onRetry={refetch} /></div>;

  const isInStock = product.stock_status === 'IN_STOCK';
  const images = product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImg];
  const isCurrentFailed = imgErrors[selectedImg];

  const handleAddToCart = () => {
    if (!isInStock) return;
    // Use ProductListItem shape for cart
    const listItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      category: product.category,
      primary_image: product.primary_image,
      is_active: product.is_active,
    };
    addToCart(listItem, qty);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      <title>{product.name} — Flembe Essence</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/shop" className="inline-flex items-center gap-2 font-body text-sm text-off-black/50 hover:text-burgundy mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ─── Image Gallery ─────────────────────────────────────────── */}
          <div>
            <div className="relative aspect-square bg-nude overflow-hidden mb-3">
              {currentImage && !isCurrentFailed ? (
                <img
                  src={currentImage.url || currentImage.image_url}
                  alt={currentImage.alt_text || product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgErrors(prev => ({ ...prev, [selectedImg]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-9xl text-burgundy/10">F</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors"
                  >
                    <ChevronLeft size={16} className="text-burgundy" />
                  </button>
                  <button
                    onClick={() => setSelectedImg(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors"
                  >
                    <ChevronRight size={16} className="text-burgundy" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 flex-shrink-0 overflow-hidden border-2 transition-colors ${i === selectedImg ? 'border-burgundy' : 'border-transparent'}`}
                  >
                    <img
                      src={img.url || img.image_url}
                      alt={img.alt_text}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ──────────────────────────────────────────── */}
          <div>
            {product.category && (
              <Link
                to={`/categories/${product.category.slug}`}
                className="font-body text-xs tracking-widest uppercase text-rose-smoke hover:text-burgundy transition-colors mb-2 inline-block"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-display text-4xl text-off-black leading-snug mb-4">{product.name}</h1>
            <PriceDisplay price={product.price} className="text-3xl" />
            <div className="my-4">
              <StockBadge status={product.stock_status} />
            </div>
            {product.material && (
              <p className="font-body text-sm text-off-black/60 mb-1">
                <span className="font-semibold text-off-black">Material:</span> {product.material}
              </p>
            )}
            {product.description && (
              <p className="font-body text-sm text-off-black/70 leading-relaxed my-5 border-t border-nude-dark pt-5">
                {product.description}
              </p>
            )}
            {product.sku && (
              <p className="font-body text-xs text-off-black/30 mb-6">SKU: {product.sku}</p>
            )}

            {isInStock && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-nude-dark">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-nude-dark transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 font-body text-sm min-w-[40px] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                    className="px-3 py-2 hover:bg-nude-dark transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-body text-xs text-off-black/40">{product.stock_quantity} available</p>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`w-full flex items-center justify-center gap-3 py-4 font-body text-sm tracking-widest uppercase transition-all duration-200 ${
                isInStock ? 'btn-primary' : 'bg-nude-dark text-off-black/40 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={16} />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <Link to="/checkout" className="block text-center mt-3 btn-outline w-full py-4">
              Proceed to Checkout
            </Link>

            <p className="font-body text-xs text-off-black/30 mt-4 text-center">
              Cash on Delivery only · No Return / No Exchange
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
