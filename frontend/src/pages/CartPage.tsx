import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const handleRemove = (productId: number, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from bag`, {
      style: {
        background: '#1B1B1B',
        color: '#E8D9C1',
        fontSize: '12px',
        fontFamily: 'Jost, sans-serif',
      },
    });
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-[70vh] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white border border-nude-dark/40 rounded-2xl p-8 sm:p-12 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-burgundy/5 flex items-center justify-center mb-6 border border-burgundy/15">
            <ShoppingBag size={36} className="text-burgundy stroke-[1.5]" />
          </div>
          <span className="font-body text-[11px] uppercase tracking-[0.25em] text-rose-smoke font-semibold block mb-2">
            Your Bag is Empty
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-off-black mb-3">
            No items in your bag yet
          </h1>
          <p className="font-body text-sm text-off-black/65 leading-relaxed mb-8">
            Explore our curated jewellery collections and find affordable, elegant accessories made for your everyday style.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="btn-primary">
              <ShoppingBag size={15} />
              <span>Explore Jewellery</span>
            </Link>
            <Link to="/wishlist" className="btn-outline">
              <span>View Wishlist</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-body text-off-black/50 mb-3">
            <Link to="/" className="hover:text-burgundy transition-colors">Home</Link>
            <span>/</span>
            <span className="text-burgundy font-medium">Shopping Bag</span>
          </nav>
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-nude-dark/40 pb-5">
            <div>
              <span className="font-body text-[11px] uppercase tracking-[0.25em] text-rose-smoke font-semibold block mb-1">
                Review & Confirm
              </span>
              <h1 className="font-display text-3xl sm:text-4xl text-off-black">
                Your Shopping Bag
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-xs text-off-black/60 bg-white border border-nude-dark/40 px-3 py-1.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to empty your bag?')) {
                    clearCart();
                    toast('Shopping bag cleared', { icon: '🗑️' });
                  }
                }}
                className="text-xs font-body text-off-black/50 hover:text-red-600 transition-colors underline underline-offset-4"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Free Delivery Banner */}
        <div className="bg-white border border-rose-smoke/30 rounded-xl p-4 mb-8 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0 text-burgundy">
            <Sparkles size={18} />
          </div>
          <p className="font-body text-xs sm:text-sm text-off-black/85 leading-snug">
            <strong className="font-semibold text-burgundy">Student & Campus Benefit:</strong> Enjoy <strong>Free Cash on Delivery</strong> at DIU Main Campus, Prime University, Mirpur 1, and surrounding campus zones!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-nude-dark/40 shadow-xs divide-y divide-nude-dark/25 overflow-hidden">
              {cart.map((item) => {
                const imgUrl = item.product.primary_image?.url || item.product.primary_image?.image_url;
                const unitPrice = parseFloat(item.product.price);
                const lineTotal = unitPrice * item.quantity;
                const maxStock = item.product.stock_quantity ?? 99;

                return (
                  <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-nude/10 transition-colors">
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-nude/40 flex-shrink-0 border border-nude-dark/30 group block"
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display text-xl text-burgundy/30">
                          FE
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {item.product.category && (
                        <span className="font-body text-[10px] uppercase tracking-widest text-rose-smoke font-semibold block mb-1">
                          {item.product.category.name}
                        </span>
                      )}
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="font-display text-lg sm:text-xl text-off-black hover:text-burgundy transition-colors line-clamp-1 block"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.material && (
                        <p className="font-body text-xs text-off-black/55 mt-0.5 truncate">
                          Material: {item.product.material}
                        </p>
                      )}
                      <div className="mt-2 font-display text-base text-burgundy font-medium sm:hidden">
                        ৳{unitPrice.toLocaleString()} each
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3">
                      <div className="flex items-center border border-nude-dark/60 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="p-2 text-off-black/70 hover:text-burgundy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center font-body text-xs font-semibold select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, Math.min(maxStock, item.quantity + 1))}
                          disabled={item.quantity >= maxStock}
                          aria-label="Increase quantity"
                          className="p-2 text-off-black/70 hover:text-burgundy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      {item.quantity >= maxStock && (
                        <span className="font-body text-[10px] text-amber-700">Max stock</span>
                      )}
                    </div>

                    {/* Line Total & Remove */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:min-w-[90px]">
                      <div className="text-right">
                        <span className="hidden sm:block font-body text-[10px] uppercase tracking-wider text-off-black/40">
                          Total
                        </span>
                        <span className="font-display text-xl text-burgundy font-bold">
                          ৳{lineTotal.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product.id, item.product.name)}
                        className="text-off-black/40 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back link */}
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-widest text-burgundy font-semibold hover:text-burgundy-light transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-nude-dark/40 p-6 shadow-xs sticky top-28 space-y-5">
              <h2 className="font-display text-xl text-off-black border-b border-nude-dark/30 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 font-body text-xs text-off-black/75">
                <div className="flex items-center justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-off-black">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span>Estimated Delivery</span>
                  <span className="text-emerald-700 font-medium text-right">
                    Calculated at Checkout<br />
                    <span className="text-[10px] text-off-black/50 font-normal">Free for campus routes</span>
                  </span>
                </div>
                <div className="border-t border-nude-dark/30 pt-3 flex items-baseline justify-between">
                  <span className="font-display text-lg text-off-black font-semibold">Subtotal Due</span>
                  <span className="font-display text-2xl text-burgundy font-bold">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-3.5 shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} />
              </button>

              <div className="pt-3 border-t border-nude-dark/30 space-y-2.5 font-body text-[11px] text-off-black/70">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Truck size={14} className="flex-shrink-0" />
                  <span>Cash on Delivery across Dhaka & Cox's Bazar</span>
                </div>
                <div className="flex items-center gap-2 text-burgundy">
                  <ShieldCheck size={14} className="flex-shrink-0" />
                  <span>Doorstep Inspection upon receiving</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
