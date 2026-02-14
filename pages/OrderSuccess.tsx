
import React, { useMemo, useEffect, useState } from 'react';
import { Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Loader2, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams() as { orderId: string };
  const { orders } = useStore();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Try to get order from navigation state (instant)
  // 2. Fallback to finding it in the context orders (async sync)
  const order = useMemo(() => {
    const stateOrder = location.state?.order as Order;
    if (stateOrder && stateOrder.id === orderId) return stateOrder;
    return orders.find(o => o.id === orderId);
  }, [orders, orderId, location.state]);

  useEffect(() => {
    // Give context a moment to sync if needed
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Show a clean loading state while verifying the order
  if (isInitializing && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader2 className="w-10 h-10 text-[#00a651] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Verifying Order...</h2>
      </div>
    );
  }

  // Only redirect home if we are absolutely sure the order doesn't exist
  if (!isInitializing && !order) return <Navigate to="/" />;

  if (!order) return null;

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4 flex justify-center items-start font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 md:p-14 animate-in fade-in zoom-in duration-500">

        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-black w-12 h-12" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">Success!</h1>
          <p className="text-black font-bold text-lg">Your order has been placed successfully.</p>
        </div>

        {/* Order Number Box */}
        <div className="bg-[#fdfcf0] rounded-2xl p-6 text-center mb-12 border border-[#f5f1d8] shadow-sm">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Order Reference Number</span>
          <span className="text-3xl font-black text-gray-800 tracking-tight">#{order.id}</span>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 border-b border-gray-50 pb-12">
          <div className="space-y-4">
            <h3 className="font-black text-gray-800 text-[13px] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
              Shipping Details
            </h3>
            <div className="text-gray-500 font-medium text-[14px] space-y-1 bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-900 font-bold">{order.customerName}</p>
              <p>{order.customerAddress}</p>
              <p>{order.customerArea}, {order.customerDistrict}</p>
              <p className="text-black font-bold mt-2">{order.customerPhone}</p>
            </div>
          </div>

          <div className="space-y-4 text-left md:text-right">
            <h3 className="font-black text-gray-800 text-[13px] uppercase tracking-widest flex items-center justify-start md:justify-end gap-2">
              Order Info
              <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            </h3>
            <div className="text-gray-500 font-medium text-[14px] space-y-2">
              <div className="flex justify-between md:justify-end gap-3">
                <span className="text-gray-400">Date:</span>
                <span className="text-gray-800 font-bold">{order.date}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-3">
                <span className="text-gray-400">Payment:</span>
                <span className="text-gray-800 font-bold">Cash on Delivery</span>
              </div>
              <div className="flex justify-between md:justify-end gap-3 items-center">
                <span className="text-gray-400">Status:</span>
                <span className="bg-gray-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-black font-black text-[13px] uppercase tracking-widest mb-6">
            <Package size={16} />
            <span>Items Purchased</span>
          </div>

          <div className="space-y-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-50 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg p-2 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <img src={item.selectedVariantImage || item.images?.[0] || ''} className="max-h-full max-w-full object-contain" alt={item.name} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 text-[14px] leading-tight truncate max-w-[150px] md:max-w-xs">{item.name}</h4>
                    <p className="text-gray-500 font-black text-[10px] uppercase mt-0.5">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-black text-gray-900 text-sm">৳{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Footer */}
        <div className="border-t-2 border-dashed border-gray-100 pt-8 space-y-4 mb-14">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Subtotal</span>
            <span className="text-gray-700 font-black">৳{order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-black font-black uppercase tracking-widest text-[11px]">Promo Discount</span>
              <span className="text-black font-black">-৳{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Shipping Fee</span>
            <span className="text-gray-700 font-black">৳{order.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <span className="text-xl font-black text-gray-800 uppercase tracking-tighter">Grand Total</span>
            <span className="text-3xl font-black text-gray-900 tracking-tighter">৳{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Final Actions */}
        <div className="space-y-4">
          <Link to="/" className="block w-full bg-emerald-500 hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 text-white font-black py-5 rounded-2xl text-center transition-all shadow-xl shadow-emerald-200 text-sm uppercase tracking-widest active:scale-95">
            Back to Shopping
          </Link>
          <div className="text-center">
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              A confirmation email has been sent to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
