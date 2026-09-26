import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, MapPin, ExternalLink } from 'lucide-react';
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
  items?: OrderItem[];
}

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending Confirmation' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Processing' },
  SHIPPED: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Out for Delivery' },
  DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
  FAILED_DELIVERY: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed Delivery' },
};

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders/');
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
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
            <h1 className="font-display text-3xl sm:text-4xl text-burgundy">My Orders</h1>
            <p className="font-body text-xs sm:text-sm text-off-black/60 mt-1">
              Track and review all Cash on Delivery orders placed under your account
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
          <div className="bg-red-50 border border-red-200 p-6 text-center">
            <p className="font-body text-sm text-red-600">Failed to load your orders. Please refresh the page.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-nude-dark p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <ShoppingBag size={48} className="text-nude-dark mx-auto mb-4" />
            <h2 className="font-display text-2xl text-off-black mb-2">No orders placed yet</h2>
            <p className="font-body text-xs text-off-black/60 mb-6">
              When you order jewellery and accessories, they will appear here with live delivery status updates.
            </p>
            <Link to="/shop" className="btn-primary">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const statusCfg = STATUS_BADGES[ord.order_status] || {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                label: ord.order_status,
              };
              const dateStr = new Date(ord.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-nude-dark shadow-sm overflow-hidden transition-all hover:border-nude-darker"
                >
                  {/* Order Card Top Bar */}
                  <div className="bg-nude/30 px-6 py-4 border-b border-nude-dark flex flex-wrap items-center justify-between gap-3">
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
                          Date
                        </span>
                        <span className="font-body text-xs text-off-black/80">{dateStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-body text-[11px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.label}
                      </span>
                      <Link
                        to={`/order-success?order=${ord.order_number}`}
                        className="text-xs text-burgundy hover:underline flex items-center gap-1 font-body"
                        title="View order confirmation"
                      >
                        Details <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    {/* Items table / list */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="divide-y divide-nude-dark/40 mb-6">
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

                    {/* Footer Info & Totals */}
                    <div className="pt-4 border-t border-nude-dark/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-body">
                      <div className="flex items-start gap-2 text-off-black/70">
                        <MapPin size={14} className="text-burgundy flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-off-black">{ord.delivery_zone?.name || 'Local Delivery'}</p>
                          <p className="text-[11px] text-off-black/60">{ord.address}</p>
                        </div>
                      </div>

                      <div className="bg-nude/20 p-3 rounded-xs flex items-center gap-6 justify-between md:justify-end">
                        <div>
                          <span className="text-[10px] uppercase text-off-black/50 block">Payment Method</span>
                          <span className="font-bold text-burgundy">Cash on Delivery</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-off-black/50 block">Total Amount</span>
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
