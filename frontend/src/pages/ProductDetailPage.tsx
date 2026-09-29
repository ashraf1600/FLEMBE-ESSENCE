import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Truck,
  ShieldCheck, Check, Star, ThumbsUp, MessageSquarePlus, X, RefreshCw, Bell, Send
} from 'lucide-react';
import {
  fetchProductBySlug, fetchProductReviews, submitProductReview,
  markReviewHelpful, fetchProducts, submitRestockRequest
} from '../lib/queries';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { validateBDPhone, normalizeBDPhone } from '../lib/phone';
import { ErrorState, Breadcrumbs, ProductCardSkeleton } from '../components/UI';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [justAdded, setJustAdded] = useState(false);

  // Restock Notification State
  const [restockPhone, setRestockPhone] = useState(user?.phone || '');
  const [restockSubmitted, setRestockSubmitted] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  const queryClient = useQueryClient();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<number, boolean>>({});

  const { mutate: requestRestock, isPending: isRestockPending } = useMutation({
    mutationFn: submitRestockRequest,
    onSuccess: (data) => {
      setRestockSubmitted(true);
      toast.success(data.message || 'We will message you when this item is restocked!', {
        style: { background: '#4B1D3F', color: '#E8D9C1' },
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.response?.data?.phone?.[0] || 'Failed to submit restock request.';
      toast.error(msg);
    },
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const phoneVal = validateBDPhone(restockPhone);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.errorMessage || 'Please enter a valid 11-digit Bangladeshi mobile number.');
      return;
    }
    requestRestock({
      product_slug: product.slug,
      phone: normalizeBDPhone(restockPhone),
      email: user?.email,
    });
  };

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', slug],
    queryFn: () => fetchProductReviews(slug!),
    enabled: !!slug,
  });

  // Reset gallery/quantity when navigating between products
  // (state adjustment during render — the React-endorsed reset pattern)
  const [prevSlug, setPrevSlug] = React.useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setSelectedImg(0);
    setQty(1);
    setImgErrors({});
  }

  // Related pieces from the same category (excludes the current product)
  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ['products', { category: product?.category?.slug, exclude: product?.id }],
    queryFn: () => fetchProducts({ category: product!.category!.slug, page: 1 }),
    enabled: !!product?.category?.slug,
  });
  const relatedProducts = (relatedData?.results || [])
    .filter(p => p.id !== product?.id)
    .slice(0, 4);

  const submitReviewMutation = useMutation({
    mutationFn: submitProductReview,
    onSuccess: (res) => {
      toast.success(res.message || 'Review submitted successfully!', {
        style: { background: '#4B1D3F', color: '#E8D9C1', fontFamily: 'Jost, sans-serif' },
        iconTheme: { primary: '#D8A7B1', secondary: '#4B1D3F' },
      });
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewBody('');
      setReviewerName('');
      setReviewerEmail('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.reviewer_name?.[0] || 'Failed to submit review.';
      toast.error(msg);
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: markReviewHelpful,
    onSuccess: (_, reviewId) => {
      setHelpfulVoted(prev => ({ ...prev, [reviewId]: true }));
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewerName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!reviewBody.trim()) {
      toast.error('Please write a review comment.');
      return;
    }
    submitReviewMutation.mutate({
      product: product.id,
      reviewer_name: reviewerName.trim(),
      reviewer_email: reviewerEmail.trim() || undefined,
      rating: reviewRating,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
    });
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" role="status" aria-label="Loading product">
      <div className="skeleton h-4 w-64 rounded-full mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-6 space-y-3">
          <div className="skeleton aspect-square rounded-sm" />
          <div className="flex gap-2.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skeleton w-18 h-18 rounded-xs flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 space-y-5">
          <div className="skeleton h-3 w-28 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-full" />
          <div className="skeleton h-8 w-40 rounded-full" />
          <div className="skeleton h-20 w-full rounded-xs" />
          <div className="skeleton h-12 w-full rounded-xs" />
          <div className="skeleton h-12 w-full rounded-xs" />
        </div>
      </div>
    </div>
  );
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
    toast.success(`${qty}x ${product.name} added to your bag!`);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <>
      <title>{product.name} — Flembe Essence</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Shop', to: '/shop' },
            ...(product.category
              ? [{ label: product.category.name, to: `/categories/${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* ─── Image Gallery (Column 1) ─────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-3">
            <div
              className="relative aspect-square bg-white rounded-sm overflow-hidden border border-nude-dark/50 shadow-sm"
              tabIndex={0}
              role="region"
              aria-label={`Product images${images.length > 1 ? ' — use left and right arrow keys to browse' : ''}`}
              onKeyDown={e => {
                if (images.length < 2) return;
                if (e.key === 'ArrowLeft') setSelectedImg(i => (i - 1 + images.length) % images.length);
                if (e.key === 'ArrowRight') setSelectedImg(i => (i + 1) % images.length);
              }}
            >
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
                  {/* Image counter */}
                  <span className="absolute bottom-3 right-3 z-10 font-body text-[11px] font-medium bg-off-black/70 text-nude px-2.5 py-1 rounded-full backdrop-blur-xs tabular-nums">
                    {selectedImg + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Product image thumbnails">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    role="tab"
                    aria-selected={i === selectedImg}
                    aria-label={`View image ${i + 1} of ${images.length}`}
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

              {/* Rating Summary Link */}
              {reviewsData?.stats && reviewsData.stats.total_reviews > 0 ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(reviewsData.stats.average_rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}
                      />
                    ))}
                  </div>
                  <span className="font-body text-xs font-semibold text-off-black">
                    {reviewsData.stats.average_rating.toFixed(1)}
                  </span>
                  <span className="text-off-black/30 text-xs">·</span>
                  <a href="#customer-reviews" className="font-body text-xs font-medium text-burgundy hover:underline">
                    {reviewsData.stats.total_reviews} {reviewsData.stats.total_reviews === 1 ? 'review' : 'reviews'}
                  </a>
                </div>
              ) : null}
              
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
                {product.stock_quantity <= 5 && (
                  <p className="inline-flex items-center gap-2 font-body text-xs font-semibold text-burgundy bg-rose-smoke/25 border border-rose-smoke/50 rounded-full px-3.5 py-1.5" aria-live="polite">
                    <span className="w-1.5 h-1.5 rounded-full bg-burgundy animate-pulse" />
                    Only {product.stock_quantity} left in stock — order soon
                  </p>
                )}
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
              <div className="bg-nude/40 border-2 border-burgundy/20 p-5 rounded-xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-burgundy text-nude rounded-full flex-shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-burgundy font-semibold">
                      Out of Stock — Join Restock Waitlist
                    </h3>
                    <p className="font-body text-xs text-off-black/75 mt-0.5 leading-relaxed">
                      This piece is currently unavailable. Enter your mobile number below and we'll alert you the instant new batches arrive.
                    </p>
                  </div>
                </div>

                {restockSubmitted ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-body flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>You're on the priority waitlist!</strong> We will message you via SMS/WhatsApp as soon as it's restocked.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleRestockSubmit} className="space-y-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="restock_phone" className="text-[11px] font-medium text-off-black uppercase tracking-wider">
                          Your Mobile Number (BD)
                        </label>
                        {restockPhone && (
                          <span className="text-[10px] font-mono text-off-black/60">
                            {validateBDPhone(restockPhone).operatorName || ''} {validateBDPhone(restockPhone).digitsCount}/11
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          id="restock_phone"
                          type="tel"
                          value={restockPhone}
                          onChange={(e) => setRestockPhone(normalizeBDPhone(e.target.value))}
                          placeholder="01XXXXXXXXX"
                          className="flex-1 input-field font-mono text-xs py-2"
                          maxLength={15}
                        />
                        <button
                          type="submit"
                          disabled={isRestockPending}
                          className="btn-primary py-2 px-4 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isRestockPending ? (
                            <span>Submitting...</span>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Notify Me</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-off-black/50">
                      Need it urgently? Message us directly on{' '}
                      <a
                        href="https://www.instagram.com/_flembe_._essence_?stkn=MmI4OG8yem9mZ2hn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-burgundy underline hover:text-burgundy-light font-medium"
                      >
                        Instagram
                      </a>{' '}
                      or Facebook.
                    </p>
                  </form>
                )}
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

        {/* ─── You May Also Like ──────────────────────────────────────────── */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <section aria-label="Related products" className="mt-16 pt-12 border-t border-nude-dark/60">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="font-body text-xs tracking-[0.2em] uppercase text-rose-smoke font-semibold block mb-1">
                  Complete the look
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-off-black">
                  You May Also Like
                </h2>
              </div>
              {product.category && (
                <Link
                  to={`/categories/${product.category.slug}`}
                  className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-burgundy font-bold border-b-2 border-burgundy/40 pb-2 hover:text-burgundy-light hover:border-burgundy transition-colors self-start sm:self-auto"
                >
                  More {product.category.name}
                </Link>
              )}
            </div>

            {relatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[0, 1, 2, 3].map(i => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {relatedProducts.map(item => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── Customer Reviews Section ───────────────────────────────────── */}
        <section id="customer-reviews" className="mt-16 pt-12 border-t border-nude-dark/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-rose-smoke font-semibold block mb-1">
                Verified Opinions
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-off-black">
                Customer Reviews
              </h2>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs font-body text-xs tracking-wider uppercase font-semibold text-white transition-all shadow-xs hover:shadow-md cursor-pointer bg-burgundy hover:bg-burgundy-light"
            >
              <MessageSquarePlus size={15} />
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Overall Rating Breakdown */}
            <div className="lg:col-span-4 bg-white border border-nude-dark/60 rounded-xs p-6 shadow-xs">
              <h3 className="font-display text-lg text-off-black mb-4">Rating Overview</h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-4xl text-burgundy font-bold">
                  {reviewsData?.stats?.average_rating ? reviewsData.stats.average_rating.toFixed(1) : '5.0'}
                </span>
                <span className="font-body text-xs text-off-black/50">out of 5.0</span>
              </div>

              {/* Star icons */}
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={s <= Math.round(reviewsData?.stats?.average_rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}
                  />
                ))}
              </div>
              <p className="font-body text-xs text-off-black/60 mb-6">
                Based on {reviewsData?.stats?.total_reviews || 0} customer reviews
              </p>

              {/* Rating Bars */}
              <div className="space-y-2 font-body text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsData?.stats?.rating_counts?.[stars] || 0;
                  const total = reviewsData?.stats?.total_reviews || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-6 text-off-black/70 font-medium">{stars}★</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${reviewsData?.stats?.total_reviews ? pct : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-off-black/50 text-[11px]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="lg:col-span-8 space-y-4">
              {reviewsLoading ? (
                <div className="py-12 text-center font-body text-xs text-off-black/50">
                  <RefreshCw size={20} className="animate-spin mx-auto text-burgundy mb-2" />
                  Loading customer reviews...
                </div>
              ) : !reviewsData?.results || reviewsData.results.length === 0 ? (
                <div className="bg-white border border-nude-dark/60 rounded-xs p-10 text-center">
                  <p className="font-display text-lg text-off-black mb-1">No reviews yet</p>
                  <p className="font-body text-xs text-off-black/60 mb-5">
                    Be the first to share your experience with this beautiful piece!
                  </p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs font-body text-xs tracking-wider uppercase font-semibold text-burgundy border border-burgundy hover:bg-burgundy hover:text-white transition-all cursor-pointer"
                  >
                    <MessageSquarePlus size={14} />
                    Leave the First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsData.results.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white border border-nude-dark/60 rounded-xs p-5 shadow-xs transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm select-none bg-burgundy text-nude"
                          >
                            {rev.reviewer_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-body text-sm font-semibold text-off-black">
                                {rev.reviewer_name}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check size={10} className="stroke-[3]" />
                                Verified Buyer
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}
                                  />
                                ))}
                              </div>
                              <span className="text-off-black/30 text-[10px]">·</span>
                              <span className="font-body text-[11px] text-off-black/40">
                                {new Date(rev.created_at).toLocaleDateString('en-BD', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {rev.title && (
                        <h4 className="font-body text-sm font-semibold text-off-black mb-1.5">
                          {rev.title}
                        </h4>
                      )}
                      <p className="font-body text-xs text-off-black/80 leading-relaxed mb-3">
                        {rev.body}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-nude-dark/30 font-body text-xs">
                        <button
                          onClick={() => {
                            if (!helpfulVoted[rev.id]) {
                              helpfulMutation.mutate(rev.id);
                            }
                          }}
                          disabled={helpfulVoted[rev.id] || helpfulMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer ${
                            helpfulVoted[rev.id]
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-off-black/60 hover:text-burgundy hover:bg-nude/30'
                          }`}
                        >
                          <ThumbsUp size={12} className={helpfulVoted[rev.id] ? 'fill-emerald-600' : ''} />
                          <span>{helpfulVoted[rev.id] ? 'Marked helpful' : 'Helpful'}</span>
                          <span className="text-off-black/40">({rev.helpful_count})</span>
                        </button>
                        <span className="text-[10px] text-off-black/40 uppercase tracking-wider">
                          Real Customer
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Write a Review Modal ───────────────────────────────────────── */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-off-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-xs border border-nude-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-off-black/50 hover:text-off-black hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <span className="font-body text-xs tracking-[0.2em] uppercase text-rose-smoke font-semibold block mb-1">
                Share Your Experience
              </span>
              <h3 className="font-display text-2xl text-off-black mb-1">
                Review {product.name}
              </h3>
              <p className="font-body text-xs text-off-black/60 mb-6">
                Your feedback helps our small artisan workshop grow and guides other customers!
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="block font-body text-xs font-semibold uppercase tracking-wider text-off-black mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={
                            star <= (hoverRating || reviewRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="font-body text-xs font-medium text-off-black/70 ml-2">
                      {reviewRating === 5 && '★★★★★ Excellent'}
                      {reviewRating === 4 && '★★★★☆ Very Good'}
                      {reviewRating === 3 && '★★★☆☆ Average'}
                      {reviewRating === 2 && '★★☆☆☆ Poor'}
                      {reviewRating === 1 && '★☆☆☆☆ Disappointed'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs font-semibold text-off-black mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nusrat Jahan"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xs border border-nude-dark focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs font-semibold text-off-black mb-1">
                      Email Address <span className="text-off-black/40 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. nusrat@example.com"
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xs border border-nude-dark focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-off-black mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gorgeous design, fast delivery to DIU!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xs border border-nude-dark focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-off-black mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="What did you think of the material, shine, packaging, and delivery experience?"
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xs border border-nude-dark focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-dark/40">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 font-body text-xs uppercase tracking-wider text-off-black/70 hover:text-off-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitReviewMutation.isPending}
                    className="px-6 py-2.5 rounded-xs font-body text-xs tracking-wider uppercase font-semibold text-white inline-flex items-center gap-2 shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer bg-burgundy hover:bg-burgundy-light"
                  >
                    {submitReviewMutation.isPending ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;
