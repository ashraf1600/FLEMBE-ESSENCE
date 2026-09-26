import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-4xl text-burgundy mb-3">Order Confirmed!</h1>
        <p className="font-body text-sm text-off-black/60 mb-8">
          Thank you for your order. We'll process it shortly and deliver to your address.
        </p>

        {orderNumber && (
          <div className="bg-nude p-6 mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-off-black/40 mb-1">Order Number</p>
            <p className="font-display text-2xl text-burgundy">{orderNumber}</p>
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
          <div className="bg-white p-6 shadow-sm text-left mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-burgundy" />
              <h2 className="font-display text-lg text-burgundy">Order Details</h2>
            </div>
            <div className="space-y-2 font-body text-sm text-off-black/70">
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
              <div className="border-t border-nude-dark pt-3 mt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{parseFloat(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{parseFloat(order.delivery_charge) === 0 ? 'Free' : `৳${parseFloat(order.delivery_charge).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-off-black text-base border-t border-nude-dark pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-burgundy">৳{parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-nude/50 font-body text-xs text-center text-off-black/50">
              Payment: Cash on Delivery · Status: {order.order_status}
            </div>
          </div>
        ) : null}

        <p className="font-body text-xs text-off-black/40 mb-6">
          For any queries, call us at{' '}
          <a href="tel:01865330801" className="text-burgundy hover:underline">01865330801</a>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          <Link to="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
