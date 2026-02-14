
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import MyAccount from './pages/MyAccount';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import TrackOrder from './pages/TrackOrder';

import DynamicPage from './pages/DynamicPage';
import { StoreProvider, useStore } from './context/StoreContext';

const AppContent: React.FC = () => {
  const { isAdmin, loading, storeInfo } = useStore();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Update Favicon and SEO Meta Tags dynamically
  useEffect(() => {
    // 1. Favicon
    const iconUrl = storeInfo?.favicon_url || storeInfo?.logo_url;
    if (iconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = 'image/png';
      link.href = iconUrl;
    }

    // 2. Meta Title
    // 2. Meta Title
    if (storeInfo?.meta_title) {
      document.title = storeInfo.meta_description
        ? `${storeInfo.meta_title} | ${storeInfo.meta_description}`
        : storeInfo.meta_title;
    } else if (storeInfo?.name) {
      document.title = storeInfo.name;
    }

    // 3. Meta Description
    if (storeInfo?.meta_description) {
      let metaDesc: HTMLMetaElement | null = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(metaDesc);
      }
      metaDesc.content = storeInfo.meta_description;
    }
  }, [storeInfo?.logo_url, storeInfo?.favicon_url, storeInfo?.meta_title, storeInfo?.meta_description, storeInfo?.name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-[50%] h-12 w-12 border-t-2 border-b-2 border-[#4F0343]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <CartSidebar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          <Route path="/admin" element={isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" />} />
          <Route path="/admin/:tab" element={isAdmin ? <Admin /> : <Navigate to="/login" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/:slug" element={<DynamicPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
