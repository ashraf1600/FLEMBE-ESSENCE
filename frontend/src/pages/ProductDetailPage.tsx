import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Truck,
  ShieldCheck, Check, Star, ThumbsUp, MessageSquarePlus, X, RefreshCw
} from 'lucide-react';
import {
  fetchProductBySlug, fetchProductReviews, submitProductReview,
  markReviewHelpful
} from '../lib/queries';
import { useCart } from '../context/CartContext';
import { LoadingSpinner, ErrorState } from '../components/UI';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [justAdded, setJustAdded] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  const queryClient = useQueryClient();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<number, boolean>>({});

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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs font-body text-xs tracking-wider uppercase font-semibold text-white transition-all shadow-xs hover:shadow-md cursor-pointer"
              style={{ background: '#4B1D3F' }}
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
                            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm select-none"
                            style={{ background: '#4B1D3F', color: '#E8D9C1' }}
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
                    className="px-6 py-2.5 rounded-xs font-body text-xs tracking-wider uppercase font-semibold text-white inline-flex items-center gap-2 shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    style={{ background: '#4B1D3F' }}
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
