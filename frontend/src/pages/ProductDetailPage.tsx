import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Truck, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { fetchProductBySlug } from '../lib/queries';
import { useCart } from '../context/CartContext';
import { LoadingSpinner, ErrorState } from '../components/UI';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, totalItems } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [justAdded, setJustAdded] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className="py-24"><LoadingSpinner message="Loading handcrafted jewellery details..." /></div>;
  if (isError || !product) return <div className="py-24"><ErrorState onRetry={refetch} /></div>;

  const isInStock = product.stock_status === 'IN_STOCK';
  const images = product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImg];
  const isCurrentFailed = imgErrors[selectedImg];

  const handleAddToCart = () => {
    if (!isInStock) return;
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
    setJustAdded(true);
    toast.success(`${qty}x ${product.name} added to cart!`, {
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

  return (
    <>
      <title>{product.name} — Flembe Essence</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-body text-off-black/60 mb-6">
          <Link to="/" className="hover:text-burgundy transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-burgundy transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/categories/${product.category.slug}`} className="hover:text-burgundy transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-burgundy font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* ─── Image Gallery (Column 1) ─────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-square bg-white rounded-sm overflow-hidden border border-nude-dark/50 shadow-sm">
              {currentImage && !isCurrentFailed ? (
                <img
                  src={currentImage.url || currentImage.image_url}
                  alt={currentImage.alt_text || product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={() => setImgErrors(prev => ({ ...prev, [selectedImg]: true }))}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-nude/40">
                  <span className="font-display text-8xl text-burgundy/20">FE</span>
                  <span className="text-xs uppercase tracking-widest text-burgundy/40 mt-2 font-body">Flembe Essence</span>
                </div>
              )}

              {/* Stock Badge Overlay */}
              <div className="absolute top-4 left-4 z-10">
                {isInStock ? (
                  <span className="badge-in-stock shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({product.stock_quantity} left)
                  </span>
                ) : (
                  <span className="badge-out-of-stock shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Image Carousel Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-off-black p-2 rounded-full shadow-md transition-all hover:scale-105"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImg(i => (i + 1) % images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-off-black p-2 rounded-full shadow-md transition-all hover:scale-105"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className={`w-18 h-18 rounded-xs overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === selectedImg
                        ? 'border-burgundy ring-2 ring-burgundy/20 shadow-xs'
                        : 'border-nude-dark/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url || img.image_url}
                      alt={img.alt_text || `View ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Details & Order Flow (Column 2) ─────────────────── */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {product.category && (
                <Link
                  to={`/categories/${product.category.slug}`}
                  className="font-body text-xs tracking-[0.2em] uppercase text-rose-smoke font-semibold hover:text-burgundy transition-colors inline-block mb-1"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="font-display text-3xl sm:text-4xl text-off-black leading-tight mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-display text-3xl sm:text-4xl text-burgundy font-semibold">
                  ৳{parseFloat(product.price).toLocaleString()}
                </span>
                <span className="font-body text-xs uppercase tracking-wider text-off-black/50">
                  Cash on Delivery
                </span>
              </div>
            </div>

            {/* Key Specs */}
            <div className="space-y-1.5 py-3 border-y border-nude-dark/40 font-body text-xs">
              {product.material && (
                <div className="flex items-center gap-2">
                  <span className="text-off-black/60 uppercase tracking-wider w-20">Material:</span>
                  <span className="text-off-black font-medium">{product.material}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-2">
                  <span className="text-off-black/60 uppercase tracking-wider w-20">SKU Code:</span>
                  <span className="text-off-black/80 font-mono text-[11px]">{product.sku}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-off-black/60 uppercase tracking-wider w-20">Delivery:</span>
                <span className="text-emerald-700 font-medium">Free at DIU & Mirpur 1 · Flat rate elsewhere</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm font-body text-off-black/75 text-sm leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {/* Order Controls */}
            {isInStock ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="font-body text-xs uppercase tracking-wider text-off-black/70 font-semibold">Quantity:</span>
                  <div className="flex items-center border border-nude-dark bg-white rounded-xs">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="px-3.5 py-2 hover:bg-nude/40 text-off-black transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-4 py-2 font-body text-xs font-semibold min-w-[36px] text-center select-none">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                      className="px-3.5 py-2 hover:bg-nude/40 text-off-black transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-body text-xs text-off-black/50">
                    ({product.stock_quantity} in stock)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-xs font-body text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      justAdded
                        ? 'bg-emerald-700 text-white'
                        : 'bg-burgundy text-nude hover:bg-burgundy-light hover:shadow-md'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check size={16} className="stroke-[3]" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <Link
                    to="/checkout"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-xs font-body text-xs tracking-widest uppercase text-center bg-rose-smoke text-off-black font-semibold hover:bg-rose-smoke-light transition-all shadow-sm"
                  >
                    Order Now (COD)
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-center font-body text-xs">
                This item is currently out of stock. Follow us on Instagram for restock announcements!
              </div>
            )}

            {/* Trust and Policy Info Box */}
            <div className="bg-nude/30 border border-nude-dark/60 rounded p-4 space-y-3 pt-4 text-xs font-body">
              <div className="flex items-start gap-2.5">
                <Truck size={16} className="text-burgundy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-off-black font-semibold">Cash on Delivery Across Dhaka & Cox's Bazar</strong>
                  <p className="text-off-black/70 text-[11px] mt-0.5">
                    Pay upon receipt. Free delivery to Daffodil International University, Prime University, Mirpur 1, and select student routes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-nude-dark/30 pt-3">
                <ShieldCheck size={16} className="text-burgundy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-off-black font-semibold">Doorstep Inspection Policy</strong>
                  <p className="text-off-black/70 text-[11px] mt-0.5">
                    Please inspect your jewellery upon delivery. As per store policy, <strong>No Return / No Exchange</strong> after receiving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
