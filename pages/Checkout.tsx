
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Truck, ChevronDown, Loader2, CreditCard, Ticket, AlertCircle } from 'lucide-react';
import { DISTRICT_AREA_DATA } from '../constants';
import CustomSelect from '../components/CustomSelect';

interface CheckoutFormData {
  fullName: string;
  address: string;
  district: string;
  area: string;
  phone: string;
  email: string;
  notes: string;
}

const Checkout: React.FC = () => {
  const { cart, appliedCoupon, placeOrder, shippingSettings, user, userProfile, addresses } = useStore();
  const navigate = useNavigate();

  // Initialize state from LocalStorage if available
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const saved = localStorage.getItem('checkout_form_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved checkout form", e);
      }
    }
    return {
      fullName: '',
      address: '',
      district: '',
      area: '',
      phone: '',
      email: '',
      notes: ''
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('checkout_form_data', JSON.stringify(formData));
  }, [formData]);

  // SMART SYNC: Only fill empty fields from profile
  useEffect(() => {
    if (user) {
      const defaultAddress = addresses.length > 0 ? addresses[0] : null;
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userProfile?.full_name || user.user_metadata?.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || defaultAddress?.phone || '',
        address: prev.address || defaultAddress?.addressLine || '',
        district: prev.district || defaultAddress?.district || '',
        area: prev.area || defaultAddress?.area || ''
      }));
    }
  }, [user, userProfile, addresses]);

  const districts = Object.keys(DISTRICT_AREA_DATA).sort((a, b) => a.localeCompare(b));
  const areas = formData.district ? DISTRICT_AREA_DATA[formData.district] : [];

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isDhaka = formData.district?.toLowerCase() === 'dhaka';
  const shipping = formData.district ? (isDhaka ? shippingSettings.insideDhaka : shippingSettings.outsideDhaka) : 0;

  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.discountType === 'Fixed' ? appliedCoupon.discountValue : (subtotal * appliedCoupon.discountValue / 100);
  }
  const total = subtotal + shipping - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setCheckoutError(null);
  };

  const handleDistrictChange = (value: string) => {
    setFormData(prev => ({ ...prev, district: value, area: '' }));
    setCheckoutError(null);
  };

  const handleAreaChange = (value: string) => {
    setFormData(prev => ({ ...prev, area: value }));
    setCheckoutError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      const order = await placeOrder(formData);
      // Clear saved form data on success
      localStorage.removeItem('checkout_form_data');
      navigate(`/order-success/${order.id}`, {
        state: { order },
        replace: true
      });
    } catch (err: any) {
      console.error("Detailed Checkout Error:", err);

      // PARANOID ERROR PARSING: Ensure we never show [object Object]
      let msg = "Something went wrong while processing your order.";

      if (err) {
        if (typeof err === 'string') {
          msg = err;
        } else if (err.message && typeof err.message === 'string') {
          msg = err.message;
        } else if (err.details && typeof err.details === 'string') {
          msg = err.details;
        } else if (err.error_description && typeof err.error_description === 'string') {
          msg = err.error_description;
        } else {
          try {
            msg = JSON.stringify(err);
            // If stringified error is just empty object string
            if (msg === '{}' || msg === '[]') msg = "Database connection error. Please ensure the SQL script was run in Supabase.";
          } catch (e) {
            msg = "An unexpected error occurred. Please check your internet connection.";
          }
        }
      }

      setCheckoutError(msg);
      setIsSubmitting(false);
      alert(`Checkout Failed: ${msg}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/')} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors">Return to Store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-black text-gray-800 mb-8 tracking-tight uppercase">Checkout</h1>

        {checkoutError && (
          <div className="mb-8 bg-red-50 border border-red-100 rounded-none p-6 flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 shadow-sm">
            <div className="w-12 h-12 bg-white rounded-none shadow-sm flex items-center justify-center text-red-500 shrink-0 border border-red-50">
              <AlertCircle size={28} />
            </div>
            <div className="pt-1">
              <h4 className="font-black text-red-800 uppercase text-[10px] tracking-[2px] mb-1">Processing Error</h4>
              <p className="text-sm font-bold text-red-600/90 leading-relaxed">{checkoutError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-12">
              <h2 className="text-xl font-black text-gray-800 mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <span className="w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center text-lg font-black border border-gray-200">01</span>
                Shipping Information
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-8">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="ex: Mr./Mrs/Ms" className="w-full bg-white border border-gray-200 rounded-full md:rounded-full px-4 py-4 md:px-6 md:py-4 outline-none focus:bg-white focus:border-black transition-all text-gray-800 font-bold placeholder:text-gray-300 placeholder:font-normal" />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="ex: 01234567" className="w-full bg-white border border-gray-200 rounded-full px-4 py-4 md:px-6 md:py-4 outline-none focus:bg-white focus:border-black transition-all text-gray-800 font-bold placeholder:text-gray-300 placeholder:font-normal" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input required name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="user@email.com" className="w-full bg-white border border-gray-200 rounded-full px-4 py-4 md:px-6 md:py-4 outline-none focus:bg-white focus:border-black transition-all text-gray-800 font-bold placeholder:text-gray-300 placeholder:font-normal" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="ex: House no. / building / street / area" className="w-full bg-white border border-gray-200 rounded-full px-4 py-4 md:px-6 md:py-4 outline-none focus:bg-white focus:border-black transition-all text-gray-800 font-bold placeholder:text-gray-300 placeholder:font-normal" />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District/Zilla</label>
                  <CustomSelect
                    options={districts}
                    value={formData.district}
                    onChange={handleDistrictChange}
                    placeholder="Select Di..."
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area</label>
                  <CustomSelect
                    options={areas}
                    value={formData.area}
                    onChange={handleAreaChange}
                    placeholder="Select Th..."
                    disabled={!formData.district}
                  />
                </div>

              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
              <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-4 uppercase tracking-tighter"><span className="w-10 h-10 rounded-full bg-gray-100 text-black flex items-center justify-center text-lg font-black border border-gray-200">02</span>Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 md:gap-6 p-4 md:p-8 border-2 border-black bg-gray-50 rounded-2xl cursor-pointer shadow-none transition-transform active:scale-[0.99]">
                  <input type="radio" name="payment" defaultChecked className="w-5 h-5 md:w-6 md:h-6 accent-black" />
                  <div className="flex-1">
                    <span className="font-black text-gray-800 text-sm md:text-lg block leading-none mb-1 md:mb-2">Cash on Delivery</span>
                    <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[1px] leading-tight block">Standard delivery in 2-3 business days.</span>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-none flex items-center justify-center text-black shadow-md">
                    <Truck className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 p-5 md:p-10 sticky top-24 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <h2 className="text-2xl font-black text-black mb-10 uppercase tracking-tighter border-b border-gray-50 pb-6 relative z-10">Summary</h2>
              <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
                {cart.map(item => {
                  const itemKey = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
                  return (
                    <div key={itemKey} className="flex gap-3 md:gap-5 group items-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                        <img src={item.selectedVariantImage || item.images?.[0] || ''} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs md:text-[13px] font-bold text-gray-800 leading-tight mb-1 truncate">{item.name}</h4>
                        <div className="text-[10px] text-black font-black uppercase tracking-widest bg-gray-100 w-fit px-2 py-0.5 rounded-none border border-gray-200">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-xs md:text-sm font-black text-gray-800 whitespace-nowrap">৳{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-50 pt-6 md:pt-8 space-y-3 md:space-y-5 relative z-10">
                <div className="flex justify-between text-xs md:text-[14px] font-bold text-gray-400 uppercase tracking-widest"><span>Subtotal</span><span className="text-gray-800">৳{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs md:text-[14px] font-bold text-gray-400 uppercase tracking-widest"><span>Shipping</span><span className="text-gray-800">৳{shipping.toFixed(2)}</span></div>

                {appliedCoupon && (
                  <div className="flex justify-between text-xs md:text-[14px] font-black text-black items-center bg-gray-50 p-3 md:p-4 rounded-none border border-gray-200 animate-in slide-in-from-right-2">
                    <span className="flex items-center gap-2"><Ticket size={14} /> {appliedCoupon.code}</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 md:pt-8 border-t border-gray-100">
                  <span className="text-lg md:text-xl font-black text-black uppercase tracking-tighter">Total</span>
                  <div className="text-right">
                    <span className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">৳{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 md:mt-10 text-white font-black py-4 md:py-6 rounded-full shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[2px] text-sm md:text-[16px] relative z-10 ${isSubmitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 shadow-emerald-200/50 active:scale-95'}`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : 'Confirm Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
