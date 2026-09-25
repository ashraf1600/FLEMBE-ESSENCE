import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, CheckCircle } from 'lucide-react';
import { fetchDeliveryZones } from '../lib/queries';
import { LoadingSpinner } from '../components/UI';

const DeliveryPage: React.FC = () => {
  const { data: zones, isLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: fetchDeliveryZones,
  });

  const freeZones = zones?.filter(z => z.is_free) || [];
  const paidZones = zones?.filter(z => !z.is_free) || [];

  return (
    <>
      <title>Delivery Information — Flembe Essence</title>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="section-subtitle">Shipping Info</p>
          <h1 className="section-title">Delivery Information</h1>
          <p className="font-body text-sm text-off-black/60 mt-4 max-w-xl mx-auto">
            We currently deliver across Dhaka and Cox's Bazar. Payment is Cash on Delivery (COD) only.
          </p>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Delivery */}
            <div className="bg-emerald-50 p-6">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle size={20} className="text-emerald-600" />
                <h2 className="font-display text-xl text-emerald-700">Free Delivery Areas</h2>
              </div>
              <ul className="space-y-3">
                {freeZones.map(zone => (
                  <li key={zone.id} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-medium text-off-black">{zone.name}</p>
                      <p className="font-body text-xs text-off-black/40">{zone.city}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid Delivery */}
            <div className="bg-nude p-6">
              <div className="flex items-center gap-2 mb-5">
                <Truck size={20} className="text-burgundy" />
                <h2 className="font-display text-xl text-burgundy">Other Delivery Areas</h2>
              </div>
              <ul className="space-y-3">
                {paidZones.map(zone => (
                  <li key={zone.id} className="flex items-start gap-3">
                    <Truck size={14} className="text-burgundy mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium text-off-black">{zone.name}</p>
                      <p className="font-body text-xs text-off-black/40">{zone.city}</p>
                    </div>
                    <span className="font-body text-sm font-semibold text-burgundy">৳{zone.delivery_charge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-10 bg-burgundy/5 border border-burgundy/20 p-6 text-center">
          <p className="font-body text-sm text-off-black/70 leading-relaxed">
            <strong className="text-burgundy">Payment:</strong> Cash on Delivery only.<br />
            <strong className="text-burgundy">Note:</strong> Delivery charges are calculated server-side based on your selected area.
            Please check your area carefully during checkout.
          </p>
        </div>
      </div>
    </>
  );
};

export default DeliveryPage;
