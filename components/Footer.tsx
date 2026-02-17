
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useStore } from '../context/StoreContext';

const Footer: React.FC = () => {
  const { storeInfo, categories } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-900 pt-8 md:pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Company Info */}
          <div className="space-y-4 col-span-2 md:col-span-1 lg:col-span-1">
            <div className="mb-6">
              {storeInfo.logo_url ? (
                <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-16 w-auto object-contain" />
              ) : (
                <div className="text-emerald-500 mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.2 7.8l-7.7 7.7a2 2 0 0 1-2.8 0L2 7.8" />
                    <path d="M2 12l7.7 7.7a2 2 0 0 0 2.8 0l7.7-7.7" />
                  </svg>
                </div>
              )}
            </div>
            <p className="leading-relaxed">{storeInfo.footer_description || `${storeInfo.name} - Your one door-step solution for groceries and daily needs. Freshness guaranteed.`}</p>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-500 shrink-0" size={18} />
                <span>{storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-emerald-500 shrink-0" size={18} />
                <span>{storeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-emerald-500 shrink-0" size={18} />
                <span>{storeInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              {(storeInfo.footer_links && storeInfo.footer_links.length > 0) ? (
                storeInfo.footer_links.map((link, idx) => (
                  <li key={idx}><Link to={link.url} className="hover:text-emerald-500 transition-colors">{link.label}</Link></li>
                ))
              ) : (
                <>
                  <li><Link to="/about-us" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
                  <li><Link to="/contact-us" className="hover:text-emerald-500 transition-colors">Contact Us</Link></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Delivery Information</a></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms & Conditions</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Category</h3>
            <ul className="space-y-3">
              {categories
                .filter(cat => !cat.parentId)
                .slice(0, 5)
                .map(cat => (
                  <li key={cat.id}>
                    <Link to={`/products?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase())}`} className="hover:text-emerald-500 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Social */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="grid grid-cols-2 md:block gap-4">
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-6">Social Links</h3>
                <div className="flex gap-4 mb-6">
                  {storeInfo.socials?.facebook && <a href={storeInfo.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black border border-transparent flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"><Facebook size={18} /></a>}
                  {storeInfo.socials?.instagram && <a href={storeInfo.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black border border-transparent flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"><Instagram size={18} /></a>}
                  {(!storeInfo.socials?.facebook && !storeInfo.socials?.instagram) && <span className="text-gray-500 text-sm">No social links configured.</span>}
                </div>
              </div>

              <div className="flex flex-col justify-center items-start pt-2 md:pt-0">
                <div className="flex flex-wrap gap-2">
                  {storeInfo.app_links?.android && (
                    <a href={storeInfo.app_links.android} target="_blank" rel="noopener noreferrer" className="block w-28 hover:opacity-90 transition-opacity">
                      <img src="https://dnaziaddhwmqalwrdgex.supabase.co/storage/v1/object/public/product-images/google-play.svg" alt="Get it on Google Play" className="w-full h-auto" />
                    </a>
                  )}
                  {storeInfo.app_links?.ios && (
                    <a href={storeInfo.app_links.ios} target="_blank" rel="noopener noreferrer" className="block w-28 hover:opacity-90 transition-opacity">
                      <img src="https://dnaziaddhwmqalwrdgex.supabase.co/storage/v1/object/public/product-images/app-store.svg" alt="Download on App Store" className="w-full h-auto" />
                    </a>
                  )}
                  {!storeInfo.app_links?.ios && !storeInfo.app_links?.android && (
                    <div className="block w-28 opacity-50 cursor-not-allowed">
                      <img src="https://dnaziaddhwmqalwrdgex.supabase.co/storage/v1/object/public/product-images/google-play.svg" alt="Get it on Google Play" className="w-full h-auto" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-[11px] md:text-sm">
            © {currentYear} {storeInfo.name}. All rights reserved. <span className="text-gray-500 mx-1">|</span> Developed by: <a href="https://shakilmahmud.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">Shakil Mahmud</a>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
