import React from 'react';
import { Link } from 'react-router-dom';
import {
    Heart, ShieldCheck, Zap, User, Star, Truck,
    Leaf, Award, Clock, MapPin, Phone, CreditCard,
    Gift, Smile, Sun, Droplets, ShoppingBasket, Tag,
    Globe, Anchor, Coffee, Package, Layers, Info, CheckCircle, Mail, FileText
} from 'lucide-react';

// --- Icon Mapping ---
const ICONS: Record<string, any> = {
    Heart, ShieldCheck, Zap, User, Star, Truck,
    Leaf, Award, Clock, MapPin, Phone, CreditCard,
    Gift, Smile, Sun, Droplets, ShoppingBasket, Tag,
    Globe, Anchor, Coffee, Package, Layers, Info, CheckCircle, Mail, FileText
};

export const StorySection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-6">
                {data.badge && (
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-none text-xs font-black uppercase tracking-widest inline-block">
                        {data.badge}
                    </span>
                )}
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                    {data.title}
                    {data.title2 && <span className="block text-gray-500 mt-1">{data.title2}</span>}
                </h2>
                <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                    {data.description}
                </div>
            </div>
            <div className="lg:w-1/2 relative group">
                <div className="relative rounded-none overflow-hidden shadow-2xl shadow-emerald-100 transform transition-transform group-hover:scale-[1.01] duration-500">
                    <img
                        src={data.image_url}
                        alt={data.title}
                        className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export const ValuesGrid: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl font-black text-gray-900">{data.title}</h2>
                <p className="text-gray-500 font-medium">{data.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.items?.map((item: any, idx: number) => {
                    const Icon = ICONS[item.icon] || Star;
                    return (
                        <div key={idx} className="bg-white p-8 rounded-none border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-emerald-50 rounded-none flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                <Icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {item.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const HeroSection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="relative overflow-hidden h-[400px] md:h-[500px] flex items-center justify-center text-center">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={data.background_url}
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 space-y-6">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                    {data.title}
                </h1>
                <p className="text-lg md:text-2xl text-gray-200 font-normal max-w-5xl mx-auto leading-relaxed drop-shadow-md">
                    {data.description}
                </p>
            </div>
        </div>
    );
};

export const CtaSection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="bg-black rounded-none p-12 md:p-16 text-center relative overflow-hidden group">
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight whitespace-pre-line tracking-tight">
                    {data.title}
                </h2>
                <p className="text-gray-400 text-lg font-medium max-w-xl mx-auto">
                    {data.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    {data.button1_text && (
                        <Link to={data.button1_link || '#'} className="bg-emerald-500 text-white border-2 border-emerald-500 inline-block px-8 py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-white hover:text-emerald-500 hover:border-emerald-500 transition-all active:scale-95 w-full sm:w-auto">
                            {data.button1_text}
                        </Link>
                    )}
                    {data.button2_text && (
                        <Link to={data.button2_link || '#'} className="bg-transparent border border-white text-white px-8 py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-white hover:text-emerald-500 hover:border-white transition-all active:scale-95 w-full sm:w-auto">
                            {data.button2_text}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ContactSection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl font-black text-gray-900">{data.title}</h2>
                <p className="text-gray-500 font-medium">{data.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.items?.map((item: any, idx: number) => {
                    const Icon = ICONS[item.icon] || Info;
                    return (
                        <div key={idx} className="bg-white p-8 rounded-none border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-none flex items-center justify-center text-gray-600 mb-6 mx-auto group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">{item.label}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm whitespace-pre-line">
                                {item.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const FaqContactSection: React.FC<{ data: any }> = ({ data }) => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    return (
        <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* FAQ Side */}
            <div className="flex-1 w-full space-y-8">
                <h2 className="text-3xl font-black text-gray-900">{data.title}</h2>
                <div className="space-y-4">
                    {data.faqs?.map((faq: any, idx: number) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div key={idx} className={`border border-gray-100 rounded-none overflow-hidden transition-all duration-300 ${isOpen ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white'}`}>
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full flex justify-between items-center p-6 text-left"
                                >
                                    <span className={`font-bold text-lg ${isOpen ? 'text-emerald-800' : 'text-gray-700'}`}>{faq.question}</span>
                                    <div className={`p-2 rounded-none transition-colors ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contact Form Side */}
            <div className="flex-1 w-full">
                <div className="bg-white p-8 md:p-10 rounded-none border border-gray-100 shadow-xl shadow-gray-100/50">
                    <h2 className="text-3xl font-black text-gray-900 mb-8">{data.formTitle}</h2>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Name</label>
                            <input type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none font-bold text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Email</label>
                            <input type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none font-bold text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Message</label>
                            <textarea className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-none text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors h-32 resize-none" placeholder="How can we help you?" />
                        </div>
                        <button type="submit" className="w-auto px-10 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-none hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all hover:scale-105 shadow-lg shadow-emerald-200">
                            Send Now
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
