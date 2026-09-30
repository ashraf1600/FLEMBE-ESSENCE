import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, MapPin, ExternalLink, CheckCircle2, Truck, Clock, AlertTriangle, XCircle } from 'lucide-react';
import api from '../lib/api';
import { LoadingSpinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

interface Order {
  id: number;
  order_number: string;
  address: string;
  subtotal: string;
  delivery_charge: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  delivery_zone?: { name: string; city: string };
  delivery_zone_name?: string;
  items?: OrderItem[];
}

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Pending Confirmation' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Preparing Items' },
  SHIPPED: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', label: 'On the Way / Out for Delivery' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Delivered' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Cancelled' },
  FAILED_DELIVERY: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Failed Delivery' },
};

const STEP_KEYS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STEP_CONFIG = [
  { key: 'PENDING', label: 'Order Placed', short: 'Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', short: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Preparing', short: 'Preparing', icon: Package },
  { key: 'SHIPPED', label: 'On the Way', short: 'On the Way', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', short: 'Delivered', icon: CheckCircle2 },
];

const STATUS_MESSAGES: Record<string, { title: string; desc: string }> = {
  PENDING: {
    title: 'Order Placed — Awaiting Store Confirmation',
    desc: 'Your Cash on Delivery order is received. Our team will verify and confirm your order shortly.',
  },
  CONFIRMED: {
    title: 'Order Confirmed by Flembe Essence',
    desc: 'Your jewellery pieces have been reserved from stock and queued for packing.',
  },
  PROCESSING: {
    title: 'Packing & Quality Inspection',
    desc: 'Our boutique team is inspecting and carefully packing your jewellery in our signature packaging.',
  },
  SHIPPED: {
    title: 'Your Order is On The Way!',
    desc: 'Rider dispatched for doorstep delivery. Please keep cash ready upon arrival.',
  },
  DELIVERED: {
    title: 'Package Successfully Delivered',
    desc: 'Thank you for choosing Flembe Essence! Check your pieces and enjoy your new jewellery.',
  },
  CANCELLED: {
    title: 'Order Cancelled',
    desc: 'This order was cancelled. If you need assistance, please contact us at 01865330801.',
  },
  FAILED_DELIVERY: {
    title: 'Delivery Attempted',
    desc: 'The delivery could not be completed on this attempt. We will reach out to reschedule.',
  },
};

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    },
    refetchInterval: (query) => {
      const orders: Order[] = Array.isArray(query.state.data) ? query.state.data : [];
      // Only poll if there are active (in-transit) orders
      const hasActive = orders.some((o: Order) =>
        ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.order_status)
      );
      return hasActive ? 15000 : false;
    },
  });

  const orders: Order[] = data || [];

  return (
    <>
      <title>My Orders — Flembe Essence</title>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-nude-dark gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl text-burgundy">My Orders</h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking Active
              </span>
            </div>
            <p className="font-body text-xs sm:text-sm text-off-black/60 mt-1">
              Live status updates for your Cash on Delivery orders
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="font-body text-xs text-off-black/40 block">Signed in as</span>
            <span className="font-body text-sm font-semibold text-off-black">{user?.name || user?.username}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 text-center rounded-xl">
            <p className="font-body text-sm text-red-600">Failed to load your orders. Please refresh the page.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-nude-dark p-12 text-center max-w-lg mx-auto shadow-sm my-8 rounded-2xl">
            <ShoppingBag size={48} className="text-nude-dark mx-auto mb-4" />
            <h2 className="font-display text-2xl text-off-black mb-2">No orders placed yet</h2>
            <p className="font-body text-xs text-off-black/60 mb-6">
              When you order jewellery and accessories, they will appear here with dynamic live delivery progress.
            </p>
            <Link to="/shop" className="btn-primary">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((ord) => {
              const statusCfg = STATUS_BADGES[ord.order_status] || {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                label: ord.order_status,
              };
              const statusMsg = STATUS_MESSAGES[ord.order_status] || {
                title: 'Order Status Updated',
                desc: 'Your order is being handled by our store team.',
              };
              const dateStr = new Date(ord.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const isSpecialStatus = ord.order_status === 'CANCELLED' || ord.order_status === 'FAILED_DELIVERY';
              const currentStepIdx = STEP_KEYS.indexOf(ord.order_status);

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-burgundy/15 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Order Card Top Bar */}
                  <div className="bg-nude/30 px-6 py-4 border-b border-nude-dark/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="font-body text-[10px] uppercase tracking-widest text-off-black/50 block">
                          Order Number
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-burgundy">
                          {ord.order_number}
                        </span>
                      </div>
                      <div className="border-l border-nude-dark/60 pl-4 hidden sm:block">
                        <span className="font-body text-[10px] uppercase tracking-widest text-off-black/50 block">
                          Placed On
                        </span>
                        <span className="font-body text-xs text-off-black/80">{dateStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-body text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                      <Link
                        to={`/order-success?order=${ord.order_number}`}
                        className="text-xs text-burgundy hover:underline flex items-center gap-1 font-body font-semibold"
                        title="View order confirmation"
                      >
                        Details <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Dynamic Visual Stepper & Status Banner */}
                  <div className="p-6">
                    {!isSpecialStatus ? (
                      <div className="mb-6 bg-nude/15 p-4 sm:p-6 rounded-xl border border-nude-dark/40">
                        {/* Stepper Progress Bar */}
                        <div className="relative">
                          {/* Background connecting bar */}
                          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-nude-dark/60 z-0 hidden sm:block" />
                          {/* Active filled connecting bar */}
                          <div
                            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-emerald-500 transition-all duration-500 z-0 hidden sm:block"
                            style={{
                              width: `${Math.min(100, Math.max(0, (currentStepIdx / (STEP_CONFIG.length - 1)) * 100))}%`,
                            }}
                          />

                          {/* Steps row */}
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

                        {/* Status Message Callout */}
                        <div className="mt-5 pt-4 border-t border-nude-dark/40 flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-burgundy mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-body text-xs font-bold text-burgundy">
                              {statusMsg.title}
                            </p>
                            <p className="font-body text-xs text-off-black/70 mt-0.5 leading-relaxed">
                              {statusMsg.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50/60 flex items-start gap-3">
                        {ord.order_status === 'CANCELLED' ? (
                          <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-body text-xs font-bold text-red-900">{statusMsg.title}</p>
                          <p className="font-body text-xs text-red-700/80 mt-0.5">{statusMsg.desc}</p>
                        </div>
                      </div>
                    )}

                    {/* Ordered Items */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="divide-y divide-nude-dark/30 mb-6 bg-white rounded-xl border border-nude-dark/40 p-4">
                        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-off-black/40 mb-2">
                          Ordered Jewellery ({ord.items.length} item{ord.items.length > 1 ? 's' : ''})
                        </p>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-body">
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-burgundy flex-shrink-0" />
                              <span className="font-medium text-off-black">{item.product_name}</span>
                              <span className="text-off-black/40">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold text-off-black">৳{Number(item.subtotal).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Delivery & Pricing Totals */}
                    <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-body">
                      <div className="flex items-start gap-2 text-off-black/70">
                        <MapPin size={15} className="text-burgundy flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-off-black">
                            {ord.delivery_zone_name || ord.delivery_zone?.name || 'Standard Delivery'}
                          </p>
                          <p className="text-[11px] text-off-black/60">{ord.address}</p>
                        </div>
                      </div>

                      <div className="bg-nude/20 p-3.5 rounded-xl border border-nude-dark/30 flex items-center gap-6 justify-between md:justify-end">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-off-black/50 block">Payment Method</span>
                          <span className="font-bold text-burgundy">Cash on Delivery</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-off-black/50 block">Total Due</span>
                          <span className="font-display text-lg text-burgundy font-bold">
                            ৳{Number(ord.total_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrdersPage;
