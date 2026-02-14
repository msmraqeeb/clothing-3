
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, Ticket, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, appliedCoupon, applyCoupon, removeCoupon } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.discountType === 'Fixed' ? appliedCoupon.discountValue : (subtotal * appliedCoupon.discountValue / 100);
  }

  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const error = applyCoupon(couponInput);
    if (error) {
      setCouponError(error);
      setTimeout(() => setCouponError(null), 3000);
    } else {
      setCouponInput('');
      setCouponError(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="w-32 h-32 mb-6 opacity-50 mix-blend-multiply" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gray-50 text-gray-500 font-bold text-[11px] uppercase tracking-widest">
                <div className="col-span-6">Product Item</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Subtotal</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map(item => {
                  const cartItemId = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
                  return (
                    <div key={cartItemId} className="group border-b border-gray-100 last:border-0 md:border-0">
                      {/* Mobile View */}
                      <div className="flex gap-4 p-4 md:hidden">
                        {/* Image */}
                        <div className="w-20 h-24 bg-white border border-gray-100 p-2 shrink-0 flex items-center justify-center">
                          <img src={item.selectedVariantImage || item.images?.[0] || ''} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight pr-2">{item.name}</h3>
                              {item.selectedVariantName && (
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 block">{item.selectedVariantName}</span>
                              )}
                            </div>
                            <button onClick={() => removeFromCart(cartItemId)} className="text-gray-300 hover:text-red-500 transition-colors -mt-1 -mr-1 p-2">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Unit Price</span>
                              <span className="font-bold text-gray-800 text-sm">৳{(Number(item.price) || 0).toFixed(2)}</span>
                            </div>

                            <div className="flex items-center border border-gray-100 rounded-full bg-gray-50/50 p-0.5 h-8">
                              <button
                                onClick={() => updateQuantity(cartItemId, -1)}
                                className="w-7 h-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-emerald-500 rounded-full transition-all"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-xs font-black text-gray-700">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(cartItemId, 1)}
                                className="w-7 h-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-emerald-500 rounded-full transition-all"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                            <span className="font-black text-gray-900">৳{((Number(item.price) || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center p-5">
                        {/* Product Info */}
                        <div className="col-span-6 flex items-center gap-4 w-full">
                          <button onClick={() => removeFromCart(cartItemId)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shrink-0 border border-gray-50 shadow-sm group-hover:scale-105 transition-transform">
                            <img src={item.selectedVariantImage || item.images?.[0] || ''} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 leading-tight text-sm">{item.name}</h3>
                            {item.selectedVariantName && (
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 block">{item.selectedVariantName}</span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-center font-bold text-gray-400 text-sm">
                          ৳{(Number(item.price) || 0).toFixed(2)}
                        </div>

                        {/* Quantity */}
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center border border-gray-100 rounded-full bg-gray-50/50 p-1">
                            <button
                              onClick={() => updateQuantity(cartItemId, -1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white hover:text-emerald-500 rounded-full transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-black text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartItemId, 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white hover:text-emerald-500 rounded-full transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-2 text-center font-black text-gray-800">
                          ৳{((Number(item.price) || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center px-2">
              <Link to="/products" className="text-emerald-600 font-black text-sm flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                <ArrowRight size={18} className="rotate-180" /> CONTINUE SHOPPING
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-black text-black mb-8 uppercase tracking-widest text-center border-b border-gray-50 pb-4">Cart Total</h2>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-gray-400 font-bold text-sm">
                  <span>Subtotal</span>
                  <span className="text-gray-800 font-black">৳{(subtotal || 0).toFixed(2)}</span>
                </div>


                {appliedCoupon && (
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Coupon Applied</span>
                      <span className="text-sm font-bold text-gray-800">{appliedCoupon.code}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-black">-৳{discount.toFixed(2)}</span>
                      <button onClick={removeCoupon} className="text-gray-300 hover:text-red-500 transition-colors"><XCircle size={16} /></button>
                    </div>
                  </div>
                )}

                <div className="border-t-2 border-dashed border-gray-100 pt-6 flex justify-between items-center">
                  <span className="font-black text-lg text-black uppercase tracking-tighter">Total</span>
                  <span className="font-black text-3xl text-gray-900 tracking-tighter">৳{(total || 0).toFixed(2)}</span>
                </div>
              </div>

              {!appliedCoupon && (
                <div className="mb-10">
                  <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest ml-1">Have a Coupon?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 border border-gray-200 rounded-full px-4 py-3 text-sm font-bold outline-none focus:border-black focus:ring-4 focus:ring-gray-50 transition-all placeholder:text-gray-300"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-emerald-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all shadow-md active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-[10px] font-black mt-2 ml-1 animate-pulse flex items-center gap-1">
                      <XCircle size={10} /> {couponError}
                    </p>
                  )}
                </div>
              )}

              <Link to="/checkout" className="block w-full bg-emerald-500 hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 text-white font-black py-5 rounded-full text-center transition-all shadow-xl shadow-gray-200 active:scale-95 uppercase tracking-widest text-sm">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
