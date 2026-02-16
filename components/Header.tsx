import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, MapPin, Truck, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { cart, wishlist, user, openCart, storeInfo, products, categories } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Filter products for live search
  const searchResults = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, products]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return (
      <header className="w-full font-sans bg-white sticky top-0 shadow-sm z-[999]">
        <div className="container mx-auto h-16 flex items-center justify-center">
          <Link to="/" className="flex-shrink-0">
            {storeInfo.logo_url ? (
              <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl font-black tracking-tighter text-black">U<span className="text-emerald-500">A</span></span>
            )}
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full font-sans relative z-[999] bg-white sticky top-0 shadow-sm">

      {/* STICKY HEADER VERSION (1 Row) */}
      {isSticky ? (
        <div className="w-full px-4 md:px-12 h-16 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            {storeInfo.logo_url ? (
              <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl font-black tracking-tighter text-black">U<span className="text-emerald-500">A</span></span>
            )}
          </Link>

          {/* Centered Navigation (Desktop) OR Search Bar */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-6">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="w-full max-w-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for products..."
                  className="w-full bg-gray-100 border-none outline-none px-6 py-3 rounded-full text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-black transition-colors">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <>
                {(storeInfo.navigation || []).slice(0, 6).map((item) => (
                  <Link key={item.id} to={item.url} className="text-sm font-bold text-gray-700 hover:text-black transition-colors uppercase tracking-wide">
                    {item.label}
                  </Link>
                ))}
                {/* Fallback if no nav items */}
                {(!storeInfo.navigation || storeInfo.navigation.length === 0) && (
                  <>
                    <Link to="/products" className="text-sm font-bold text-gray-700 hover:text-black uppercase">Shop</Link>
                    {categories.filter(c => !c.parentId).slice(0, 5).map(c => {
                      const children = categories.filter(child => child.parentId === c.id);
                      return (
                        <div key={c.id} className="relative group h-full flex items-center">
                          <Link to={`/products?category=${encodeURIComponent(c.slug || c.name)}`} className="text-sm font-bold text-gray-700 hover:text-black uppercase flex items-center gap-1">
                            {c.name}
                            {children.length > 0 && <ChevronDown size={14} />}
                          </Link>
                          {children.length > 0 && (
                            <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="bg-white border border-gray-100 shadow-xl py-2 w-48 flex flex-col text-left rounded-xl overflow-hidden">
                                {children.map(child => (
                                  <Link key={child.id} to={`/products?category=${encodeURIComponent(child.slug || child.name)}`} className="px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-gray-600 hover:text-black transition-colors border-b border-gray-50 last:border-0">
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center gap-5">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-600 hover:text-black">
              <Search size={20} strokeWidth={2} />
            </button>
            <Link to={user ? "/my-account" : "/login"} className="group">
              <User size={20} strokeWidth={2} className="text-gray-600 group-hover:text-black" />
            </Link>
            <Link to="/my-account?tab=wishlist" className="group relative">
              <Heart size={20} strokeWidth={2} className="text-gray-600 group-hover:text-red-500" />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </Link>
            <button onClick={openCart} className="group relative flex items-center gap-1">
              <ShoppingCart size={20} strokeWidth={2} className="text-gray-600 group-hover:text-black" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-black">
            <Menu size={24} />
          </button>
        </div>
      ) : (
        /* STANDARD HEADER VERSION (2 Rows) */
        <>
          {/* ROW 1: Logo & Actions */}
          <div className="border-b border-gray-100">
            <div className="w-full px-4 md:px-12 h-20 flex items-center justify-between gap-8">

              {/* LOGO */}
              <Link to="/" className="flex-shrink-0">
                {storeInfo.logo_url ? (
                  <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-10 md:h-12 w-auto object-contain" />
                ) : (
                  <span className="text-2xl font-black tracking-tighter text-black">YOUNG<span className="text-emerald-500">GALLERY</span></span>
                )}
              </Link>

              {/* SEARCH (Center) */}
              <div className="hidden md:flex flex-1 max-w-xl relative">
                <form onSubmit={handleSearch} className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search in..."
                    className="w-full bg-gray-100 border-none outline-none px-6 py-2.5 rounded-md text-sm font-medium text-gray-700 placeholder:text-gray-500 focus:ring-1 focus:ring-gray-200 transition-shadow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
                    <Search size={20} strokeWidth={2} />
                  </button>
                </form>

                {/* Live Search Popup */}
                {searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden z-50">
                    {searchResults.length > 0 ? (
                      <div>
                        {searchResults.map(p => (
                          <Link
                            key={p.id}
                            to={`/product/${p.slug}`}
                            onClick={() => setSearchQuery('')}
                            className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <h4 className="text-sm font-bold text-gray-800">{p.name}</h4>
                              <span className="text-xs font-medium text-gray-500">৳{p.price}</span>
                            </div>
                          </Link>
                        ))}
                        <Link to={`/products?search=${encodeURIComponent(searchQuery)}`} className="block p-3 text-center text-xs font-black uppercase text-gray-500 hover:text-black transition-colors bg-gray-50">
                          View All Results
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">No products found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* ACTIONS (Right) */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/track-order" className="flex flex-col items-center gap-1 group">
                  <MapPin size={22} strokeWidth={1.5} className="text-gray-700 group-hover:text-emerald-900 transition-colors" />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-emerald-900">Track Order</span>
                </Link>
                <Link to={user ? "/my-account" : "/login"} className="flex flex-col items-center gap-1 group">
                  <User size={22} strokeWidth={1.5} className="text-gray-700 group-hover:text-emerald-900 transition-colors" />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-emerald-900">{user ? 'Account' : 'Sign In'}</span>
                </Link>
                <Link to="/my-account?tab=wishlist" className="flex flex-col items-center gap-1 group relative">
                  <Heart size={22} strokeWidth={1.5} className="text-gray-700 group-hover:text-emerald-900 transition-colors" />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-emerald-900">Wishlist</span>
                  {wishlistCount > 0 && <span className="absolute -top-1 right-2 w-4 h-4 bg-emerald-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">{wishlistCount}</span>}
                </Link>
                <button onClick={openCart} className="flex flex-col items-center gap-1 group relative">
                  <ShoppingCart size={22} strokeWidth={1.5} className="text-gray-700 group-hover:text-emerald-900 transition-colors" />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-emerald-900">Cart</span>
                  {cartCount > 0 && <span className="absolute -top-1 right-2 w-4 h-4 bg-emerald-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
                </button>
                <button className="flex flex-col items-center gap-1 group relative">
                  <Menu size={22} strokeWidth={1.5} className="text-gray-700 group-hover:text-emerald-900 transition-colors" />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-emerald-900">More</span>
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-black">
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* ROW 2: Navigation Menu */}
          <div className="hidden md:block bg-[#4F0343] shadow-md relative z-40">
            <div className="w-full px-4 md:px-12 h-12 flex items-center justify-between">

              {/* Left Nav Links */}
              <div className="flex items-center gap-8 text-white h-full">
                <Link to="/" className="text-sm font-medium hover:text-white/80 transition-colors">Home</Link>

                {/* Dynamic Categories */}
                {categories.filter(c => !c.parentId).slice(0, 6).map(c => {
                  const children = categories.filter(child => child.parentId === c.id);
                  return (
                    <div key={c.id} className="relative group h-full flex items-center cursor-pointer">
                      <Link
                        to={`/products?category=${encodeURIComponent(c.slug || c.name)}`}
                        className="text-sm font-medium hover:text-white/80 transition-colors flex items-center gap-1"
                      >
                        {c.name}
                        {children.length > 0 && <ChevronDown size={14} />}
                      </Link>

                      {/* Dropdown Content */}
                      {children.length > 0 && (
                        <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="bg-white border-t-2 border-[#4F0343] shadow-xl py-2 w-48 flex flex-col text-left rounded-b-md overflow-hidden">
                            {children.map(child => (
                              <Link
                                key={child.id}
                                to={`/products?category=${encodeURIComponent(child.slug || child.name)}`}
                                className="px-4 py-2 hover:bg-gray-50 text-sm text-gray-800 font-medium transition-colors border-b border-gray-50 last:border-0"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Flash Sale Button */}
              <Link to="/products?tag=flash-sale" className="bg-white text-[#4F0343] px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                FLASH SALE
              </Link>

            </div>
          </div>
        </>
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 w-[85%] max-w-[320px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          <div className="p-5 flex justify-between items-center border-b border-gray-100">
            <span className="text-lg font-black tracking-tight">MENU</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} /></button>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-100 border-none rounded-full py-3 px-4 outline-none text-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-800 py-3 border-b border-gray-50">Home</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-gray-800 py-3 border-b border-gray-50">All Products</Link>
            {useStore().categories.filter(c => !c.parentId).map(c => (
              <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-gray-600 py-3 border-b border-gray-50 ml-2">{c.name}</Link>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-4 gap-2">
            <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center gap-1 py-1">
              <MapPin size={20} className="text-gray-500" />
              <span className="text-[9px] font-bold text-gray-500 uppercase">Track</span>
            </Link>
            <Link to="/my-account" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center gap-1 py-1">
              <User size={20} className="text-gray-500" />
              <span className="text-[9px] font-bold text-gray-500 uppercase">Acnt</span>
            </Link>
            <Link to="/my-account?tab=wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center gap-1 py-1">
              <Heart size={20} className="text-gray-500" />
              <span className="text-[9px] font-bold text-gray-500 uppercase">Wish</span>
            </Link>
            <button onClick={() => { setIsMobileMenuOpen(false); openCart(); }} className="flex flex-col items-center justify-center gap-1 py-1 relative">
              <ShoppingCart size={20} className="text-gray-500" />
              {cartCount > 0 && <span className="absolute top-0 right-2 w-3 h-3 bg-emerald-500 rounded-full"></span>}
              <span className="text-[9px] font-bold text-gray-500 uppercase">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
