import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, CheckCircle2, Clock, MapPin, Package, Phone, ShoppingBag, Truck, XCircle, AlertTriangle } from 'lucide-react';
import { fetchOrder } from '../lib/queries';
import { LoadingSpinner } from '../components/UI';

const STEP_KEYS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STEP_CONFIG = [
  { key: 'PENDING', label: 'Order Placed', short: 'Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', short: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Preparing', short: 'Preparing', icon: Package },
  { key: 'SHIPPED', label: 'On the Way', short: 'On the Way', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', short: 'Delivered', icon: CheckCircle2 },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-100 text-amber-900 border-amber-300', text: 'text-amber-800', label: 'Pending Confirmation' },
  CONFIRMED: { bg: 'bg-blue-100 text-blue-900 border-blue-300', text: 'text-blue-800', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-purple-100 text-purple-900 border-purple-300', text: 'text-purple-800', label: 'Preparing Items' },
  SHIPPED: { bg: 'bg-sky-100 text-sky-900 border-sky-300', text: 'text-sky-800', label: 'On the Way' },
  DELIVERED: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', text: 'text-emerald-800', label: 'Delivered' },
  CANCELLED: { bg: 'bg-slate-200 text-slate-800 border-slate-300', text: 'text-slate-600', label: 'Cancelled' },
  FAILED_DELIVERY: { bg: 'bg-red-100 text-red-900 border-red-300', text: 'text-red-700', label: 'Failed Delivery' },
};

const STATUS_DESCS: Record<string, string> = {
  PENDING: 'Your Cash on Delivery order is received and queued for store verification.',
  CONFIRMED: 'Order confirmed! Jewellery items are reserved and queued for dispatch.',
  PROCESSING: 'Quality inspection and signature packaging in progress.',
  SHIPPED: 'Package is on the way with our delivery rider. Please keep cash ready.',
  DELIVERED: 'Delivered successfully! Thank you for shopping with Flembe Essence.',
  CANCELLED: 'This order was cancelled. Call 01865330801 for help.',
  FAILED_DELIVERY: 'Delivery could not be completed on this attempt. We will reach out shortly.',
};

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchOrder(orderNumber),
    enabled: !!orderNumber,
    refetchInterval: (query) => {
      const status = query.state.data?.order_status;
      if (status === 'DELIVERED' || status === 'CANCELLED' || status === 'FAILED_DELIVERY') {
        return false;
      }
      return 15000;
    },
  });

  const currentStatus = order?.order_status || 'PENDING';
  const statusCfg = STATUS_BADGES[currentStatus] || STATUS_BADGES.PENDING;
  const currentStepIdx = STEP_KEYS.indexOf(currentStatus);
  const isSpecial = currentStatus === 'CANCELLED' || currentStatus === 'FAILED_DELIVERY';

  return (
    <>
      <title>Order Confirmed — Flembe Essence</title>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_0_10px_rgba(16,185,129,0.06)]">
            <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.5} />
          </div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-rose-smoke mb-2">Thank you for choosing Flembe</p>
          <h1 className="font-display text-5xl sm:text-6xl text-burgundy leading-none mb-4">Order confirmed.</h1>
          <p className="font-body text-sm text-off-black/60 max-w-md mx-auto leading-relaxed">
            Your pieces are reserved. We will prepare them with care and deliver them to your door.
          </p>
        </div>

        {orderNumber && (
          <div className="max-w-3xl mx-auto bg-burgundy text-nude px-6 py-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl rounded-t-2xl">
            <div>
              <p className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-rose-smoke mb-1">Order number</p>
              <p className="font-display text-2xl sm:text-3xl">{orderNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 font-body text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${statusCfg.bg}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {statusCfg.label}
              </span>
            </div>
          </div>
        )}

        {/* Live Stepper Tracker on Order Confirmation */}
        <div className="max-w-3xl mx-auto bg-white border border-t-0 border-burgundy/15 p-6 mb-8 rounded-b-2xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-nude-dark/40 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy font-body flex items-center gap-2">
              <Package size={15} /> Live Delivery Progress
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Updating
            </span>
          </div>

          {!isSpecial ? (
            <div>
              {/* Desktop Connecting Line & Steps */}
              <div className="relative my-4">
                <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-nude-dark/50 z-0 hidden sm:block" />
                <div
                  className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-emerald-500 transition-all duration-500 z-0 hidden sm:block"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIdx / (STEP_CONFIG.length - 1)) * 100))}%`,
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                  {STEP_CONFIG.map((step, idx) => {
                    const isCompleted = currentStepIdx > idx;
                    const isCurrent = currentStepIdx === idx;
                    const IconComponent = step.icon;

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center gap-2.5 sm:gap-1 text-left sm:text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-burgundy text-nude ring-4 ring-rose-smoke/30 scale-110 shadow-sm animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-white border border-nude-dark text-off-black/30'
                          }`}
                        >
                          <IconComponent size={14} />
                        </div>
                        <div>
                          <p
                            className={`font-body text-xs font-semibold leading-tight ${
                              isCurrent ? 'text-burgundy font-bold' : isCompleted ? 'text-emerald-800' : 'text-off-black/40'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-off-black/45 hidden sm:block mt-0.5">
                            {isCurrent ? '● Active' : isCompleted ? '✓ Done' : 'Upcoming'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status explanation */}
              <div className="mt-5 p-3.5 bg-nude/20 rounded-xl border border-nude-dark/40 text-xs font-body text-off-black/80 flex items-start gap-2.5">
                <span className="text-base leading-none">💡</span>
                <p>{STATUS_DESCS[currentStatus] || STATUS_DESCS.PENDING}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-body text-red-700 flex items-center gap-2.5">
              {currentStatus === 'CANCELLED' ? <XCircle size={18} className="text-red-500" /> : <AlertTriangle size={18} className="text-amber-500" />}
              <p>{STATUS_DESCS[currentStatus]}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading order details..." />
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 p-4 mb-8 font-body text-sm text-red-600 rounded-xl max-w-3xl mx-auto">
            Could not load order details. Please note your order number above and contact us at{' '}
            <a href="tel:01865330801" className="underline">01865330801</a> if you need help.
          </div>
        ) : order ? (
          <div className="max-w-3xl mx-auto bg-white border border-nude-dark/40 shadow-lg text-left mb-8 overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-nude-dark/40">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-burgundy" />
                <h2 className="font-display text-xl text-burgundy">Order Summary</h2>
              </div>
              <span className="font-body text-[10px] uppercase tracking-wider text-off-black/40">Cash on delivery</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 px-6 py-5 bg-nude/20 font-body text-xs text-off-black/70">
              <div className="flex justify-between">
                <span>Customer</span>
                <span className="font-medium text-off-black">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-medium text-off-black">{order.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Area</span>
                <span className="font-medium text-off-black">{order.delivery_zone_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Address</span>
                <span className="font-medium text-off-black text-right max-w-[60%]">{order.address}</span>
              </div>
            </div>
            {order.items?.length > 0 && (
              <div className="px-6 py-5 border-t border-nude-dark/40">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-smoke mb-3">Your pieces</p>
                <div className="space-y-2.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-4 font-body text-sm">
                      <span className="text-off-black/70"><strong className="text-burgundy">{item.quantity}x</strong> {item.product_name}</span>
                      <span className="font-medium text-off-black">৳{parseFloat(item.subtotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="px-6 py-5 border-t border-nude-dark/40 space-y-2 font-body text-sm text-off-black/70">
              <div className="border-t border-nude-dark pt-3 mt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{parseFloat(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{parseFloat(order.delivery_charge) === 0 ? 'Free' : `৳${parseFloat(order.delivery_charge).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-bold text-off-black text-lg border-t border-nude-dark pt-3 mt-3">
                  <span>Total</span>
                  <span className="text-burgundy">৳{parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-burgundy/5 border-t border-burgundy/10 grid sm:grid-cols-3 gap-3 font-body text-xs text-off-black/65">
              <span className="flex items-center gap-2"><Truck size={14} className="text-burgundy" /> COD payment</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-burgundy" /> {order.delivery_zone_name}</span>
              <span className="flex items-center gap-2 font-semibold text-burgundy"><Package size={14} /> Status: {statusCfg.label}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3 mb-5">
          <Link to="/shop" className="btn-primary"><ShoppingBag size={15} /> Continue shopping</Link>
          <Link to="/my-orders" className="btn-outline">Track all my orders <ArrowRight size={14} /></Link>
        </div>
        <p className="flex items-center justify-center gap-2 font-body text-xs text-off-black/45"><Phone size={13} /> Need help? <a href="tel:01865330801" className="text-burgundy hover:underline">01865330801</a></p>
      </div>
    </>
  );
};

export default OrderSuccessPage;
