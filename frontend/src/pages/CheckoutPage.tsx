import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { fetchDeliveryZones, createOrder } from '../lib/queries';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/UI';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    delivery_zone_id: '',
    customer_note: '',
    policy_accepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: fetchDeliveryZones,
  });

  const selectedZone = zones?.find(z => z.id === Number(form.delivery_zone_id));
  const deliveryCharge = selectedZone ? parseFloat(selectedZone.delivery_charge) : 0;
  const total = subtotal + deliveryCharge;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      clearCart();
      navigate(`/order-success?order=${data.order_number}`);
    },
    onError: (err: any) => {
      const detail = err?.response?.data;
      if (detail?.items) toast.error(String(detail.items));
      else if (detail?.non_field_errors) toast.error(String(detail.non_field_errors));
      else toast.error('Failed to place order. Please try again.');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required.';
    else if (!/^01[3-9]\d{8}$/.test(form.phone)) newErrors.phone = 'Enter a valid BD phone number.';
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
      customer: { name: form.name.trim(), phone: form.phone.trim() },
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
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        <h1 className="font-display text-4xl text-burgundy mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                    <label htmlFor="phone" className="label">Phone Number *</label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                      placeholder="01XXXXXXXXX" className="input-field" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
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
                            className="w-6 h-6 border border-nude-dark flex items-center justify-center hover:bg-nude-dark text-xs">
                            <Minus size={10} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 border border-nude-dark flex items-center justify-center hover:bg-nude-dark text-xs">
                            <Plus size={10} />
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
