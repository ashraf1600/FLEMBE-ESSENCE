import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, MapPin, Package, Phone, ShoppingBag, Truck } from 'lucide-react';
import { fetchOrder } from '../lib/queries';
import { LoadingSpinner } from '../components/UI';

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchOrder(orderNumber),
    enabled: !!orderNumber,
    retry: 2,
  });

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
          <div className="max-w-3xl mx-auto bg-burgundy text-nude px-6 py-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div>
              <p className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-rose-smoke mb-1">Order number</p>
              <p className="font-display text-2xl sm:text-3xl">{orderNumber}</p>
            </div>
            <span className="inline-flex items-center gap-2 self-start sm:self-auto font-body text-[10px] font-semibold uppercase tracking-wider border border-rose-smoke/40 rounded-full px-3 py-1.5 text-rose-smoke">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Processing
            </span>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading order details..." />
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 p-4 mb-8 font-body text-sm text-red-600">
            Could not load order details. Please note your order number above and contact us at{' '}
            <a href="tel:01865330801" className="underline">01865330801</a> if you need help.
          </div>
        ) : order ? (
          <div className="max-w-3xl mx-auto bg-white border border-nude-dark/40 shadow-lg text-left mb-8 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-nude-dark/40">
              <div className="flex items-center gap-2">
              <Package size={16} className="text-burgundy" />
                <h2 className="font-display text-xl text-burgundy">Order details</h2>
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
              <span className="flex items-center gap-2"><Package size={14} className="text-burgundy" /> {order.order_status}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3 mb-5">
          <Link to="/shop" className="btn-primary"><ShoppingBag size={15} /> Continue shopping</Link>
          <Link to="/my-orders" className="btn-outline">Track my orders <ArrowRight size={14} /></Link>
        </div>
        <p className="flex items-center justify-center gap-2 font-body text-xs text-off-black/45"><Phone size={13} /> Need help? <a href="tel:01865330801" className="text-burgundy hover:underline">01865330801</a></p>
      </div>
    </>
  );
};

export default OrderSuccessPage;
