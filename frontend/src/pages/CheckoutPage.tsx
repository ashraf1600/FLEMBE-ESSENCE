import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { fetchDeliveryZones, createOrder } from '../lib/queries';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UI';
import { validateBDPhone, normalizeBDPhone } from '../lib/phone';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || user?.first_name || '',
    phone: user?.phone || '',
    address: '',
    delivery_zone_id: '',
    customer_note: '',
    policy_accepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: fetchDeliveryZones,
  });

  const selectedZone = zones?.find(z => z.id === Number(form.delivery_zone_id));
  const deliveryCharge = selectedZone ? parseFloat(selectedZone.delivery_charge) : 0;
  const total = subtotal + deliveryCharge;

  // Real-time BD phone validation state
  const phoneValidation = validateBDPhone(form.phone);

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      clearCart();
      navigate(`/order-success?order=${data.order_number}`);
    },
    onError: (err: any) => {
      const detail = err?.response?.data;
      if (err?.response?.status === 401) {
        toast.error('Authentication required to place an order.');
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
      } else if (detail?.items) toast.error(String(detail.items));
      else if (detail?.non_field_errors) toast.error(String(detail.non_field_errors));
      else if (detail?.customer?.phone) toast.error(String(detail.customer.phone));
      else toast.error('Failed to place order. Please try again.');
    },
  });

  React.useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || user.first_name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    
    // Bangladeshi Phone Validation
    const phoneVal = validateBDPhone(form.phone);
    if (!phoneVal.isValid) {
      newErrors.phone = phoneVal.errorMessage || 'Please provide a valid 11-digit Bangladeshi mobile number (e.g. 018XXXXXXXX).';
    }

    if (!form.address.trim()) newErrors.address = 'Address is required.';
    if (!form.delivery_zone_id) newErrors.delivery_zone_id = 'Please select a delivery area.';
    if (!form.policy_accepted) newErrors.policy_accepted = 'You must accept the policy to proceed.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cart.length === 0) { toast.error('Your cart is empty.'); return; }

    placeOrder({
      customer: { 
        name: form.name.trim(), 
        phone: normalizeBDPhone(form.phone) 
      },
      address: form.address.trim(),
      delivery_zone_id: Number(form.delivery_zone_id),
      items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
      customer_note: form.customer_note.trim(),
      policy_accepted: form.policy_accepted,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Automatically sanitize phone input when typing
    if (name === 'phone') {
      const sanitized = normalizeBDPhone(value);
      setForm(prev => ({ ...prev, phone: sanitized }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-nude-dark mx-auto mb-4" />
        <h2 className="font-display text-3xl text-burgundy mb-3">Your cart is empty</h2>
        <p className="font-body text-sm text-off-black/60 mb-8">Browse our collection and add products to your cart.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <>
      <title>Checkout — Flembe Essence</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-4xl text-burgundy mb-6">Checkout</h1>

        {/* Authenticated user banner */}
        {user ? (
          <div className="mb-8 p-3.5 bg-white border border-nude-dark flex flex-wrap items-center justify-between gap-3 text-xs font-body shadow-xs">
            <div className="flex items-center gap-2 text-off-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Signed in as <strong className="text-burgundy">{user.name || user.username}</strong> ({user.email})
              </span>
            </div>
            <Link to="/my-orders" className="text-burgundy hover:underline text-[11px] font-medium">
              View My Order History →
            </Link>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-burgundy/10 border border-burgundy/20 flex flex-wrap items-center justify-between gap-3 text-xs font-body">
            <span className="text-burgundy font-medium">
              Please sign in to confirm and place your Cash on Delivery order.
            </span>
            <Link
              to="/login"
              state={{ from: { pathname: '/checkout' } }}
              className="bg-burgundy text-nude px-3 py-1.5 font-bold uppercase tracking-wider text-[10px]"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {/* ── Mobile Order Summary Accordion (Thumb-accessible on phones) ── */}
        <div className="lg:hidden mb-6 bg-white border border-burgundy/15 p-4 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full flex items-center justify-between font-body text-xs font-bold text-burgundy cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} />
              <span>{mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
            </div>
            <span className="font-mono text-sm sm:text-base font-bold text-burgundy">৳{total.toLocaleString()}</span>
          </button>
          {mobileSummaryOpen && (
            <div className="mt-3 pt-3 border-t border-burgundy/10 space-y-2.5 animate-fade-in">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center text-xs font-body">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-medium text-off-black truncate">{item.product.name}</span>
                    <span className="text-off-black/50 text-[11px] flex-shrink-0">× {item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-burgundy flex-shrink-0">
                    ৳{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-burgundy/10 flex justify-between text-[11px] font-body text-off-black/70">
                <span>Delivery:</span>
                <span className="font-semibold text-off-black">
                  {selectedZone ? (selectedZone.is_free ? 'FREE' : `৳${selectedZone.delivery_charge}`) : 'Select area below'}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* ─── Left: Customer Form ───────────────────────────────── */}
            <div className="space-y-5">
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-display text-xl text-burgundy mb-5">Your Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="label">Full Name *</label>
                    <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      placeholder="Your full name" className="input-field" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="phone" className="label mb-0">Mobile Phone Number *</label>
                      {form.phone && (
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          {phoneValidation.operatorName && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-smoke/30 text-burgundy font-medium text-[10px]">
                              {phoneValidation.operatorName}
                            </span>
                          )}
                          <span className={`text-[11px] font-medium ${phoneValidation.isValid ? 'text-emerald-700' : 'text-off-black/50'}`}>
                            {phoneValidation.digitsCount}/11 digits {phoneValidation.isValid ? '✓' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        maxLength={15}
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="018XXXXXXXX or +88018..."
                        className={`input-field pr-10 font-mono tracking-wide ${
                          form.phone && (phoneValidation.isValid ? 'border-emerald-600 focus:border-emerald-700' : 'border-amber-400')
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {form.phone && phoneValidation.isValid ? (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : form.phone ? (
                          <PhoneCall size={16} className="text-amber-500 animate-pulse" />
                        ) : null}
                      </div>
                    </div>
                    {errors.phone ? (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={13} /> {errors.phone}
                      </p>
                    ) : (
                      <p className="text-[11px] text-off-black/60 mt-1">
                        Rider will call this number before arrival. Formats like +880 or spaces are auto-formatted.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address" className="label">Delivery Address *</label>
                    <textarea id="address" name="address" value={form.address} onChange={handleChange}
                      placeholder="Your full address" rows={3} className="input-field resize-none" />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label htmlFor="delivery_zone_id" className="label">Delivery Area *</label>
                    {zonesLoading ? <LoadingSpinner message="Loading areas..." /> : (
                      <select id="delivery_zone_id" name="delivery_zone_id" value={form.delivery_zone_id}
                        onChange={handleChange} className="input-field">
                        <option value="">— Select your area —</option>
                        {zones?.map(zone => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} ({zone.city}) — {zone.is_free ? 'Free Delivery' : `৳${zone.delivery_charge}`}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.delivery_zone_id && <p className="text-xs text-red-500 mt-1">{errors.delivery_zone_id}</p>}
                  </div>
                  <div>
                    <label htmlFor="customer_note" className="label">Note (optional)</label>
                    <textarea id="customer_note" name="customer_note" value={form.customer_note} onChange={handleChange}
                      placeholder="Any special instructions..." rows={2} className="input-field resize-none" />
                  </div>
                </div>
              </div>

              {/* Policy */}
              <div className="bg-rose-smoke/10 border border-rose-smoke/30 p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="policy_accepted"
                    checked={form.policy_accepted}
                    onChange={handleChange}
                    className="mt-1 accent-burgundy"
                  />
                  <span className="font-body text-sm text-off-black leading-relaxed">
                    I agree to the <strong>Cash on Delivery</strong> and{' '}
                    <Link to="/return-exchange" target="_blank" className="text-burgundy underline">
                      No Return/No Exchange
                    </Link>{' '}
                    policy. I understand that I must check the product upon delivery.
                  </span>
                </label>
                {errors.policy_accepted && <p className="text-xs text-red-500 mt-2">{errors.policy_accepted}</p>}
              </div>
            </div>

            {/* ─── Right: Order Summary ──────────────────────────────── */}
            <div>
              <div className="bg-white p-6 shadow-sm mb-4">
                <h2 className="font-display text-xl text-burgundy mb-5">Order Summary</h2>
                <ul className="divide-y divide-nude-dark">
                  {cart.map(item => (
                    <li key={item.product.id} className="py-4 flex items-start gap-3">
                      <div className="w-16 h-16 bg-nude flex-shrink-0 overflow-hidden">
                        {(item.product.primary_image?.url || item.product.primary_image?.image_url) ? (
                          <img src={item.product.primary_image.url || item.product.primary_image.image_url} alt={item.product.name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-burgundy/20 text-xl">F</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-off-black truncate">{item.product.name}</p>
                        <p className="font-body text-xs text-off-black/50">৳{parseFloat(item.product.price).toLocaleString()} each</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-9 h-9 border border-nude-dark flex items-center justify-center hover:bg-nude-dark text-xs">
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-9 h-9 border border-nude-dark flex items-center justify-center hover:bg-nude-dark text-xs">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-body text-sm font-semibold text-burgundy">
                          ৳{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                        </p>
                        <button type="button" onClick={() => removeFromCart(item.product.id)}
                          className="text-off-black/30 hover:text-red-400 mt-1 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-nude-dark pt-4 mt-2 space-y-2">
                  <div className="flex justify-between font-body text-sm text-off-black/70">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm text-off-black/70">
                    <span>Delivery Charge</span>
                    <span>{selectedZone ? (selectedZone.is_free ? 'Free' : `৳${deliveryCharge}`) : '—'}</span>
                  </div>
                  <div className="flex justify-between font-body text-base font-semibold text-off-black border-t border-nude-dark pt-3 mt-3">
                    <span>Total</span>
                    <span className="text-burgundy">৳{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <p className="font-body text-xs text-off-black/40 text-center mb-4">
                Payment method: Cash on Delivery (COD)
              </p>

              <button
                type="submit"
                disabled={isPending}
                className="w-full btn-primary py-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Placing Order...' : 'Place Order — COD'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CheckoutPage;
