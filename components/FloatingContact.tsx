import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, X, MessageSquare, Hexagon } from 'lucide-react';

const FloatingContact = () => {
    const { storeInfo } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    // Safety check just in case, but default to true if setting is missing (first run)
    const widgetConfig = storeInfo.floatingWidget || { isVisible: true, whatsapp: '', messenger: '', facebook: '', instagram: '', phone: '', supportImage: '' };
    if (widgetConfig.isVisible === false) return null;

    const { whatsapp, messenger, facebook, instagram, phone, supportImage } = widgetConfig;

    // Helper to open links
    const handleLink = (url: string | undefined, type: 'tel' | 'ext') => {
        if (!url) return;
        if (type === 'tel') window.open(`tel:${url}`, '_self');
        else window.open(url, '_blank');
    };

    return (
        <div className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-3 font-sans">

            {/* Expanded Menu */}
            <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>

                {/* Instagram */}
                {instagram && (
                    <button
                        onClick={() => handleLink(instagram, 'ext')}
                        className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        title="Instagram"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                    </button>
                )}

                {/* Facebook */}
                {facebook && (
                    <button
                        onClick={() => handleLink(facebook, 'ext')}
                        className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        title="Facebook"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </button>
                )}

                {/* Messenger */}
                {messenger && (
                    <button
                        onClick={() => handleLink(messenger, 'ext')}
                        className="w-10 h-10 bg-[#0084FF] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        title="Messenger"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    </button>
                )}

                {/* WhatsApp */}
                {whatsapp && (
                    <button
                        onClick={() => handleLink(`https://wa.me/${whatsapp}`, 'ext')}
                        className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        title="WhatsApp"
                    >
                        <img
                            src="https://dnaziaddhwmqalwrdgex.supabase.co/storage/v1/object/public/product-images/whatsapp.png"
                            alt="WhatsApp"
                            className="w-full h-full object-cover rounded-full"
                        />
                    </button>
                )}

                {/* Phone */}
                {phone && (
                    <button
                        onClick={() => handleLink(phone, 'tel')}
                        className="w-10 h-10 bg-[#00a651] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                        title="Phone"
                    >
                        <Phone size={20} />
                    </button>
                )}
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ backgroundColor: isOpen ? 'black' : 'transparent' }}
                className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ring-4 ring-white ${isOpen ? 'rotate-180' : 'hover:scale-105'}`}
            >
                {isOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    supportImage ? (
                        <div className="w-full h-full relative group">
                            <img src={supportImage} alt="Support" className="w-full h-full object-cover" />
                            {/* Green online dot */}
                            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-[#007bff] flex items-center justify-center text-white rounded-full">
                            <MessageSquare size={24} />
                            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                    )
                )}
            </button>
        </div>
    );
};

export default FloatingContact;
