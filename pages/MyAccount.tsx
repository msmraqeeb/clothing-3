
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  User, Package, MapPin, Heart, LogOut, AlertCircle,
  CheckCircle2, Loader2, Trash2, Lock, Plus, ChevronDown,
  ShoppingBag, Calendar, Clock, X, Edit3
} from 'lucide-react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { DISTRICT_AREA_DATA } from '../constants';
import ProductCard from '../components/ProductCard';
import { Address } from '../types';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'wishlist';

const MyAccount: React.FC = () => {
  const {
    user, userProfile, orders, addresses, wishlist, products,
    signOut, updateProfile, addAddress, updateAddress, deleteAddress,
    loading: contextLoading
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = (searchParams.get('tab') as AccountTab) || 'profile';

  // Profile States
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [fullName, setFullName] = useState('');

  // Address States
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    district: '',
    area: ''
  });

  useEffect(() => {
    if (userProfile?.full_name) {
      setFullName(userProfile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [userProfile, user]);

  // Data Filtering
  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => o.customerEmail === user.email);
  }, [orders, user]);

  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  if (contextLoading) return null;
  if (!user) return <Navigate to="/login" />;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      await updateProfile(user.id, fullName);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await addAddress(addressForm);
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({ fullName: '', phone: '', addressLine: '', district: '', area: '' });
    } catch (err: any) {
      alert("Failed to save address: " + (err.message || JSON.stringify(err)));
    }
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      district: addr.district,
      area: addr.area
    });
    setShowAddressForm(true);
  };

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || 'Customer';

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-12 font-sans text-[#1a3a34]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black text-3xl mb-4 shadow-lg shadow-emerald-100">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 w-full">
                  <h2 className="font-black text-gray-800 text-xl leading-tight mb-1 truncate">{displayName}</h2>
                  <p className="text-xs text-gray-400 font-bold truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'profile', icon: User, label: 'Account Settings' },
                  { id: 'orders', icon: Package, label: 'Order History' },
                  { id: 'addresses', icon: MapPin, label: 'My Addresses' },
                  { id: 'wishlist', icon: Heart, label: 'My Wishlist' },
                ].map((item) => (
                  <Link
                    key={item.id}
                    to={`/my-account?tab=${item.id}`}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
                <button onClick={() => signOut().then(() => navigate('/login'))} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-sm mt-4 border-t pt-6">
                  <LogOut size={18} />Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 md:p-10 animate-in fade-in duration-300">
                <h3 className="font-black text-xl text-[#1a3a34] mb-8 uppercase tracking-tighter">Account Settings</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input type="email" readOnly value={user.email} className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 outline-none" />
                    </div>
                  </div>
                  {updateSuccess && (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <CheckCircle2 size={18} />
                      <span className="text-xs font-bold">Profile updated successfully!</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" disabled={isUpdating} className="bg-emerald-500 text-white font-black px-12 py-4 rounded-2xl uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-200 hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all">
                      {isUpdating ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-[#1a3a34] uppercase tracking-tighter">Order History</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{userOrders.length} Orders Found</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-[24px] border border-gray-100 p-20 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                      <ShoppingBag size={32} />
                    </div>
                    <h4 className="text-lg font-black text-gray-800 mb-2">No Orders Yet</h4>
                    <p className="text-sm text-gray-500 mb-8 max-w-xs">You haven't placed any orders with us. Start shopping to see your history here.</p>
                    <button onClick={() => navigate('/products')} className="bg-emerald-500 text-white font-black px-8 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all">Browse Store</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                        <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-gray-100">
                            <Package size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-gray-800 tracking-tight">Order #{order.id}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {order.items.length} Items</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="font-black text-lg text-gray-900">৳{order.total.toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/order-success/${order.id}`, { state: { order } })}
                          className="w-full md:w-auto bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab - EXACT VISUAL MATCH TO SCREENSHOT */}
            {activeTab === 'addresses' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-2xl text-[#1a3a34]">My Addresses</h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressForm({ fullName: '', phone: '', addressLine: '', district: '', area: '' });
                        setShowAddressForm(true);
                      }}
                      className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                    >
                      <Plus size={16} /> Add New
                    </button>
                  )}
                </div>

                {addresses.length === 0 && !showAddressForm ? (
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-24 flex flex-col items-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-black mb-8 border border-gray-200">
                      <MapPin size={40} />
                    </div>
                    <h4 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tighter">No addresses yet</h4>
                    <p className="text-sm text-gray-500 mb-8 max-w-xs font-medium">Add a shipping address to speed up your checkout process next time.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 space-y-10 hover:shadow-2xl transition-all relative group flex flex-col justify-between overflow-hidden shadow-sm">
                        {/* Match screenshot: Icons at top right */}
                        <div className="absolute top-8 right-8 flex gap-3">
                          <button
                            onClick={() => startEditAddress(addr)}
                            className="text-gray-300 hover:text-[#00a651] transition-all p-2 bg-gray-50 rounded-xl hover:bg-emerald-50"
                            title="Edit Address"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="text-gray-300 hover:text-red-500 transition-all p-2 bg-gray-50 rounded-xl hover:bg-red-50"
                            title="Delete Address"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center gap-6">
                            {/* Rounded-square icon background from screenshot */}
                            <div className="w-16 h-16 bg-[#e6fbf2] rounded-[1.25rem] flex items-center justify-center text-[#00a651] shadow-sm shrink-0">
                              <MapPin size={28} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-black text-gray-800 text-xl leading-tight">{addr.fullName}</h4>
                              <p className="text-[14px] font-black text-gray-400 mt-1">{addr.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-[15px] text-gray-500 leading-relaxed font-bold">
                            <span className="block mb-2 text-gray-300">,</span>
                            {addr.addressLine && <span className="block text-gray-600 mb-1">{addr.addressLine}</span>}
                            <span className="block">{addr.area}, {addr.district}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAddressForm && (
                  <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-emerald-50 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                        {editingAddressId ? 'Edit Address' : 'New Address'}
                      </h3>
                      <button onClick={() => setShowAddressForm(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleAddressSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input required value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[#00a651] transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input required value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[#00a651] transition-all" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address / House / Road</label>
                          <input required value={addressForm.addressLine} onChange={e => setAddressForm({ ...addressForm, addressLine: e.target.value })} className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[#00a651] transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                          <div className="relative">
                            <select
                              required
                              value={addressForm.district}
                              onChange={e => setAddressForm({ ...addressForm, district: e.target.value, area: '' })}
                              className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[#00a651] transition-all appearance-none"
                            >
                              <option value="">Select District</option>
                              {Object.keys(DISTRICT_AREA_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area</label>
                          <div className="relative">
                            <select
                              required
                              disabled={!addressForm.district}
                              value={addressForm.area}
                              onChange={e => setAddressForm({ ...addressForm, area: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[#00a651] transition-all appearance-none disabled:opacity-50"
                            >
                              <option value="">Select Area</option>
                              {addressForm.district && DISTRICT_AREA_DATA[addressForm.district].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 flex gap-6">
                        <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black py-5 rounded-[1.5rem] uppercase text-xs tracking-widest transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] bg-emerald-500 hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 text-white font-black py-5 rounded-[1.5rem] uppercase text-xs tracking-widest shadow-2xl shadow-emerald-200 transition-all active:scale-95">
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-2xl text-[#1a3a34] uppercase tracking-tighter">My Wishlist</h3>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{wishlistProducts.length} Items Saved</span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-24 flex flex-col items-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-400 mb-8 border border-red-100">
                      <Heart size={40} />
                    </div>
                    <h4 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Wishlist Empty</h4>
                    <p className="text-sm text-gray-500 mb-8 max-w-xs font-medium">Keep track of your favorite healthy picks. Browse our store to add items here.</p>
                    <button onClick={() => navigate('/products')} className="bg-emerald-500 text-white font-black px-10 py-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all shadow-xl shadow-emerald-200">Start Exploring</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
