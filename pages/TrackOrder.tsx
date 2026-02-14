
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Search, Truck, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackOrder: React.FC = () => {
    const { orders } = useStore();
    const [orderIdInput, setOrderIdInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [searched, setSearched] = useState(false);
    const [foundOrder, setFoundOrder] = useState<any | null>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        setSearched(true);

        // Find order by ID (flexible string match) and verify phone
        const order = orders.find(o =>
            String(o.id).trim() === orderIdInput.trim() &&
            o.customerPhone && o.customerPhone.includes(phoneInput.trim())
        );

        setFoundOrder(order || null);
    };

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'Processing': return 1;
            case 'Shipped': return 2;
            case 'Delivered': return 3;
            case 'Cancelled': return -1;
            default: return 0; // Pending or others
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-[#1a3a34]">
            {/* Hero Section */}
            <div className="bg-black text-white py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400">
                        <Truck size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Track Your Order</h1>
                    <p className="text-gray-400 max-w-lg mx-auto font-medium">Enter your Order ID and Phone Number below to see the current status of your shipment.</p>
                </div>
                {/* Background Decorative */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500 rounded-full blur-[120px]"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl mt-10 relative z-20">

                {/* Search Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200 border border-gray-100 p-8 md:p-12">
                    <form onSubmit={handleTrack} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Order ID</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        placeholder="#12345"
                                        value={orderIdInput}
                                        onChange={e => setOrderIdInput(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 pl-12 font-bold text-gray-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                    />
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="tel"
                                        placeholder="017..."
                                        value={phoneInput}
                                        onChange={e => setPhoneInput(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 pl-12 font-bold text-gray-800 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-emerald-500 text-white font-black py-5 rounded-xl uppercase tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all shadow-lg active:scale-95 text-sm">
                            Track Status
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {searched && (
                    <div className="mt-12 animate-in slide-in-from-bottom-4 duration-500">
                        {foundOrder ? (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 border-b border-gray-100 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${foundOrder.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                foundOrder.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {foundOrder.status}
                                            </span>
                                            <span className="text-gray-400 font-bold text-sm">#{foundOrder.id}</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-800">Order Found</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-emerald-600">৳{foundOrder.total.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Progress Steps */}
                                {foundOrder.status !== 'Cancelled' && (
                                    <div className="p-10 border-b border-gray-100 overflow-x-auto">
                                        <div className="flex items-center justify-between min-w-[500px] relative">
                                            {/* Connector Line */}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 transition-all duration-1000`} style={{
                                                width: getStatusStep(foundOrder.status) === 1 ? '50%' : getStatusStep(foundOrder.status) >= 2 ? '100%' : '5%'
                                            }}></div>

                                            {[
                                                { step: 0, label: 'Order Placed', icon: CheckCircle2 },
                                                { step: 1, label: 'Processing', icon: Package },
                                                { step: 2, label: 'Shipped', icon: Truck },
                                                { step: 3, label: 'Delivered', icon: MapPin },
                                            ].map((s, idx) => {
                                                const currentStep = getStatusStep(foundOrder.status);
                                                const isCompleted = currentStep >= s.step;
                                                const isActive = currentStep === s.step;

                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-4 bg-white px-2">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                            isActive ? 'bg-white border-emerald-500 text-emerald-500' :
                                                                'bg-gray-50 border-gray-200 text-gray-300'
                                                            }`}>
                                                            <s.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`text-xs font-black uppercase tracking-widest ${isCompleted || isActive ? 'text-gray-800' : 'text-gray-300'}`}>{s.label}</p>
                                                            {isActive && <p className="text-[10px] font-bold text-emerald-600 mt-1">Current Status</p>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Order Details Grid */}
                                <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="font-black text-lg text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                            <MapPin size={18} className="text-emerald-500" /> Delivery Address
                                        </h3>
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <p className="font-bold text-gray-800 mb-1">{foundOrder.customerName}</p>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {foundOrder.customerAddress}<br />
                                                {foundOrder.customerArea}, {foundOrder.customerDistrict}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2 font-bold">{foundOrder.customerPhone}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="font-black text-lg text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                            <Package size={18} className="text-emerald-500" /> Order Items
                                        </h3>
                                        <div className="space-y-4">
                                            {foundOrder.items.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                    <img src={item.selectedVariantImage || item.images?.[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-white" />
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-1">Qt: {item.quantity} × ৳{item.price}</p>
                                                    </div>
                                                    <div className="ml-auto font-black text-gray-800">
                                                        ৳{(item.price * item.quantity).toFixed(0)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-red-100 p-12 text-center shadow-lg shadow-red-50">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-2">Order Not Found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">We couldn't match any order with that ID and Phone number. Please check your inputs and try again.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default TrackOrder;
