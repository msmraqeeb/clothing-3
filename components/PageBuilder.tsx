import React, { useState, useEffect, useRef } from 'react';
import {
    Trash2, MoveUp, MoveDown, Layout, Type, Grid, Image as ImageIcon,
    Heart, ShieldCheck, Zap, User, Star, Truck,
    Leaf, Award, Clock, MapPin, Phone, CreditCard,
    Gift, Smile, Sun, Droplets, ShoppingBasket, Tag,
    Globe, Anchor, Coffee, Package, Layers, Info, CheckCircle, ChevronDown, Mail, FileText, MessageSquare
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';

// --- Types ---

// --- Types ---

export type BlockType = 'rich_text' | 'story_section' | 'values_grid' | 'hero_section' | 'cta_section' | 'contact_section' | 'faq_contact_section';

export interface Block {
    id: string;
    type: BlockType;
    data: any;
}

interface PageBuilderProps {
    initialContent: string;
    onChange: (content: string) => void;
    onImageSelectRequest?: (callback: (url: string) => void) => void;
}

// --- Icons List for Values Grid ---
const ICON_OPTIONS = [
    { label: 'Care', value: 'Heart', icon: Heart },
    { label: 'Security', value: 'ShieldCheck', icon: ShieldCheck },
    { label: 'Fast', value: 'Zap', icon: Zap },
    { label: 'Community', value: 'User', icon: User },
    { label: 'Quality', value: 'Star', icon: Star },
    { label: 'Delivery', value: 'Truck', icon: Truck },
    { label: 'Organic', value: 'Leaf', icon: Leaf },
    { label: 'Premium', value: 'Award', icon: Award },
    { label: 'Time', value: 'Clock', icon: Clock },
    { label: 'Local', value: 'MapPin', icon: MapPin },
    { label: 'Support', value: 'Phone', icon: Phone },
    { label: 'Payment', value: 'CreditCard', icon: CreditCard },
    { label: 'Offer', value: 'Gift', icon: Gift },
    { label: 'Happy', value: 'Smile', icon: Smile },
    { label: 'Fresh', value: 'Sun', icon: Sun },
    { label: 'Hygiene', value: 'Droplets', icon: Droplets },
    { label: 'Shop', value: 'ShoppingBasket', icon: ShoppingBasket },
    { label: 'Price', value: 'Tag', icon: Tag },
    { label: 'Eco', value: 'Globe', icon: Globe },
    { label: 'Box', value: 'Package', icon: Package },
    { label: 'Done', value: 'CheckCircle', icon: CheckCircle },
    { label: 'Info', value: 'Info', icon: Info },
    { label: 'Mail', value: 'Mail', icon: Mail },
    { label: 'License', value: 'FileText', icon: FileText },
];

export const PageBuilder: React.FC<PageBuilderProps> = ({ initialContent, onChange, onImageSelectRequest }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);

    useEffect(() => {
        try {
            if (initialContent && initialContent.trim().startsWith('[')) {
                setBlocks(JSON.parse(initialContent));
            } else if (initialContent) {
                // Legacy content fallback
                setBlocks([{ id: crypto.randomUUID(), type: 'rich_text', data: { content: initialContent } }]);
            } else {
                setBlocks([]);
            }
        } catch (e) {
            console.error("Failed to parse page content", e);
            setBlocks([]);
        }
    }, []); // Only run on mount to avoid loop, handled by local state mostly

    // Verify if external initialContent changes drastically? 
    // Usually for an editor, we init once.

    const updateBlocks = (newBlocks: Block[]) => {
        setBlocks(newBlocks);
        onChange(JSON.stringify(newBlocks));
    };

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            data: getDefaultData(type)
        };
        updateBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        updateBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        }
        updateBlocks(newBlocks);
    };

    const updateBlockData = (id: string, newData: any) => {
        const newBlocks = blocks.map(b => b.id === id ? { ...b, data: newData } : b);
        updateBlocks(newBlocks);
    };

    const getDefaultData = (type: BlockType) => {
        switch (type) {
            case 'story_section':
                return {
                    badge: 'Our Story',
                    title: 'From Local Farm to',
                    title2: 'Your Family Table',
                    description: 'We started as a small local initiative...',
                    image_url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=800'
                };
            case 'values_grid':
                return {
                    title: 'The Values We Live By',
                    subtitle: 'We generally nourish communities through our core principles.',
                    items: [
                        { icon: 'Heart', title: 'Quality First', description: 'Every item is hand-picked...' },
                        { icon: 'User', title: 'Community Driven', description: 'We support local farmers...' },
                        { icon: 'Zap', title: 'Efficiency', description: 'Optimized logistics chain...' }
                    ]
                };
            case 'hero_section':
                return {
                    title: 'Our Mission is Freshness',
                    description: 'Providing high-quality, organic, and farm-fresh groceries delivered straight to your doorstep since 2023.',
                    background_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600'
                };
            case 'cta_section':
                return {
                    title: 'Fresh Groceries are\nJust a Click Away',
                    subtitle: 'Join thousands of families who trust SMart for their daily nutrition.',
                    button1_text: 'Browse Products',
                    button1_link: '/products',
                    button2_text: 'Contact Support',
                    button2_link: '/contact'
                };
            case 'contact_section':
                return {
                    title: 'Contact Information',
                    subtitle: "We'd love to hear from you! Reach out to us with any questions.",
                    items: [
                        { icon: 'Mail', label: 'E-mail Address', value: 'sample@example.com' },
                        { icon: 'Phone', label: 'Phone Number', value: '+8801234567890\n123456' },
                        { icon: 'MapPin', label: 'Address', value: 'London, UK' },
                        { icon: 'FileText', label: 'Trade License', value: 'License #' }
                    ]
                };
            case 'faq_contact_section':
                return {
                    title: 'People usually ask these',
                    formTitle: 'Send Us a Message',
                    faqs: [
                        { question: 'What is your return policy?', answer: 'We have a flexible return policy. If you are not satisfied with your purchase, you may be eligible for a return within the specified return period.' },
                        { question: 'What are your shipping options and delivery times?', answer: 'We offer standard and express shipping options. Delivery times vary based on your location.' },
                        { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and cash on delivery.' }
                    ]
                };
            case 'rich_text':
                return { content: '<p>Start typing here...</p>' };
            default:
                return {};
        }
    };

    return (
        <div className="space-y-8">
            {blocks.map((block, index) => (
                <div key={block.id} className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-emerald-100 transition-colors group">
                    {/* Block Header */}
                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b border-gray-100 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-white rounded-xl border border-gray-200 text-gray-400">
                                {block.type === 'story_section' && <Layout size={16} />}
                                {block.type === 'values_grid' && <Grid size={16} />}
                                {block.type === 'hero_section' && <ImageIcon size={16} />}
                                {block.type === 'cta_section' && <Zap size={16} />}
                                {block.type === 'contact_section' && <Phone size={16} />}
                                {block.type === 'faq_contact_section' && <MessageSquare size={16} />}
                                {block.type === 'rich_text' && <Type size={16} />}
                            </span>
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                                {block.type.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-30"><MoveUp size={16} /></button>
                            <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-30"><MoveDown size={16} /></button>
                            <button type="button" onClick={() => removeBlock(block.id)} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    {/* Block Editor Area */}
                    <div className="p-6">
                        {block.type === 'story_section' && (
                            <StoryBlockEditor data={block.data} onChange={(d) => updateBlockData(block.id, d)} onImageSelectRequest={onImageSelectRequest} />
                        )}
                        {block.type === 'values_grid' && (
                            <ValuesGridEditor data={block.data} onChange={(d) => updateBlockData(block.id, d)} />
                        )}
                        {block.type === 'hero_section' && (
                            <HeroSectionEditor data={block.data} onChange={(d) => updateBlockData(block.id, d)} onImageSelectRequest={onImageSelectRequest} />
                        )}
                        {block.type === 'cta_section' && (
                            <CtaSectionEditor data={block.data} onChange={(d) => updateBlockData(block.id, d)} />
                        )}
                        {block.type === 'contact_section' && (
                            <ContactSectionEditor data={block.data} onChange={(d) => updateBlockData(block.id, d)} />
                        )}
                        {block.type === 'faq_contact_section' && (
                            <FaqContactEditor data={block.data} onChange={(d) => updateBlockData(block.id, d)} />
                        )}
                        {block.type === 'rich_text' && (
                            <div className="min-h-[100px]">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">HTML Content</label>
                                <textarea
                                    value={block.data.content}
                                    onChange={(e) => updateBlockData(block.id, { content: e.target.value })}
                                    className="w-full h-32 p-4 border border-gray-200 rounded-2xl font-mono text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <p className="text-xs text-gray-400 mt-2">Basic HTML is supported.</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div className="grid grid-cols-3 gap-4">
                <button type="button" onClick={() => addBlock('story_section')} className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-emerald-500 transition-colors"><Layout size={24} /></div>
                    <span className="font-bold text-gray-600">Add Story Section</span>
                </button>
                <button type="button" onClick={() => addBlock('values_grid')} className="flex flex-col items-center gap-2 p-6 rounded-none border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-blue-500 transition-colors"><Grid size={24} /></div>
                    <span className="font-bold text-gray-600">Add Values Grid</span>
                </button>
                <button type="button" onClick={() => addBlock('hero_section')} className="flex flex-col items-center gap-2 p-6 rounded-none border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-orange-500 transition-colors"><ImageIcon size={24} /></div>
                    <span className="font-bold text-gray-600">Add Hero Section</span>
                </button>
                <button type="button" onClick={() => addBlock('cta_section')} className="flex flex-col items-center gap-2 p-6 rounded-none border-2 border-dashed border-gray-200 hover:border-emerald-700 hover:bg-emerald-50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-emerald-700 transition-colors"><Zap size={24} /></div>
                    <span className="font-bold text-gray-600">Add CTA Section</span>
                </button>
                <button type="button" onClick={() => addBlock('contact_section')} className="flex flex-col items-center gap-2 p-6 rounded-none border-2 border-dashed border-gray-200 hover:border-teal-600 hover:bg-teal-50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-teal-600 transition-colors"><Phone size={24} /></div>
                    <span className="font-bold text-gray-600">Add Contact Info</span>
                </button>
                <button type="button" onClick={() => addBlock('faq_contact_section')} className="flex flex-col items-center gap-2 p-6 rounded-none border-2 border-dashed border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors"><MessageSquare size={24} /></div>
                    <span className="font-bold text-gray-600">Add FAQ + Form</span>
                </button>
                <button type="button" onClick={() => addBlock('rich_text')} className="flex flex-col items-center gap-2 p-6 rounded-none border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
                    <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-purple-500 transition-colors"><Type size={24} /></div>
                    <span className="font-bold text-gray-600">Add Text Block</span>
                </button>
            </div>
        </div>
    );
};

// --- Sub Editors ---

const StoryBlockEditor = ({ data, onChange, onImageSelectRequest }: { data: any, onChange: (d: any) => void, onImageSelectRequest?: (callback: (url: string) => void) => void }) => {
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = await uploadToCloudinary(file);
            onChange({ ...data, image_url: url });
        } catch (error: any) {
            console.error("Error uploading image:", error);
            alert(`Error uploading image: ${error.message}`);
        }
    };

    const handleImageSelect = (url: string) => {
        onChange({ ...data, image_url: url });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Badge Text</label>
                    <input type="text" value={data.badge} onChange={e => onChange({ ...data, badge: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-emerald-600 focus:outline-none focus:border-emerald-500" placeholder="OUR STORY" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title 1 (Black)</label>
                    <input type="text" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-900 text-lg focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title 2 (Grey)</label>
                    <input type="text" value={data.title2} onChange={e => onChange({ ...data, title2: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-500 text-lg focus:outline-none focus:border-emerald-500" placeholder="Second line..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                    <textarea value={data.description} onChange={e => onChange({ ...data, description: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 h-32 focus:outline-none focus:border-emerald-500" />
                </div>
            </div>
            <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section Image</label>

                {data.image_url ? (
                    <div className="relative group">
                        <div className="rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-100 mb-2">
                            <img src={data.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={data.image_url} onChange={e => onChange({ ...data, image_url: e.target.value })} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 truncate" disabled />
                            {onImageSelectRequest && (
                                <button type="button" onClick={() => onImageSelectRequest(handleImageSelect)} className="bg-emerald-50 text-emerald-600 px-4 rounded-xl text-xs font-bold hover:bg-emerald-100">Select</button>
                            )}
                            <button type="button" onClick={() => onChange({ ...data, image_url: '' })} className="bg-red-50 text-red-500 px-4 rounded-xl text-xs font-bold hover:bg-red-100">Remove</button>
                        </div>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors group">
                        <div className="p-3 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-emerald-500 mb-3 transition-colors">
                            <Grid size={24} />
                            {/* Reusing Grid icon temporarily as placeholder or specific Upload icon */}
                        </div>
                        <span className="text-sm font-bold text-gray-500 group-hover:text-emerald-600">Click to Upload Image</span>
                        {onImageSelectRequest && (
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImageSelectRequest(handleImageSelect); }} className="mt-2 text-xs font-bold text-emerald-500 underline z-10">Or Select from Library</button>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                )}
            </div>
        </div>
    );
};

const HeroSectionEditor = ({ data, onChange, onImageSelectRequest }: { data: any, onChange: (d: any) => void, onImageSelectRequest?: (callback: (url: string) => void) => void }) => {
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = await uploadToCloudinary(file);
            onChange({ ...data, background_url: url });
        } catch (error: any) {
            console.error("Error uploading image:", error);
            alert(`Error uploading image: ${error.message}`);
        }
    };

    const handleImageSelect = (url: string) => {
        onChange({ ...data, background_url: url });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Heading (H1)</label>
                        <input type="text" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-900 text-2xl focus:outline-none focus:border-emerald-500" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Background Image</label>
                    {data.background_url ? (
                        <div className="relative group rounded-xl overflow-hidden h-32 bg-gray-900">
                            <img src={data.background_url} alt="Background" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-50">
                                    Change
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {onImageSelectRequest && (
                                    <button type="button" onClick={() => onImageSelectRequest(handleImageSelect)} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100">Select</button>
                                )}
                                <button type="button" onClick={() => onChange({ ...data, background_url: '' })} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600">Remove</button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors group">
                            <span className="text-sm font-bold text-gray-400 group-hover:text-emerald-600 flex items-center gap-2"><ImageIcon size={16} /> Upload Background</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            {onImageSelectRequest && (
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImageSelectRequest(handleImageSelect); }} className="absolute bottom-4 text-xs font-bold text-emerald-500 underline z-10">Select from Library</button>
                            )}
                        </label>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Paragraph</label>
                <textarea value={data.description} onChange={e => onChange({ ...data, description: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 h-24 focus:outline-none focus:border-emerald-500" />
            </div>
        </div>
    );
};

const CtaSectionEditor = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Main Heading</label>
                <textarea value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-900 text-xl focus:outline-none focus:border-emerald-500 h-24" placeholder="Heading..." />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Subtitle</label>
                <input type="text" value={data.subtitle} onChange={e => onChange({ ...data, subtitle: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 focus:outline-none focus:border-emerald-500" placeholder="Subtitle..." />
            </div>

            <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="space-y-4">
                    <label className="text-xs font-black text-emerald-600 uppercase tracking-widest">Button 1 (Primary)</label>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Text</label>
                        <input type="text" value={data.button1_text} onChange={e => onChange({ ...data, button1_text: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link</label>
                        <input type="text" value={data.button1_link} onChange={e => onChange({ ...data, button1_link: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Button 2 (Secondary)</label>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Text</label>
                        <input type="text" value={data.button2_text} onChange={e => onChange({ ...data, button2_text: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link</label>
                        <input type="text" value={data.button2_link} onChange={e => onChange({ ...data, button2_link: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Icon Picker Component ---
const IconPicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = ICON_OPTIONS.find(opt => opt.value === value) || ICON_OPTIONS[0];
    const SelectedIcon = selectedOption.icon;

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all text-gray-600"
            >
                <SelectedIcon size={24} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 grid grid-cols-4 gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {ICON_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${value === opt.value ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            title={opt.label}
                        >
                            <opt.icon size={20} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ValuesGridEditor = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...data, items: newItems });
    };

    const addItem = () => {
        onChange({ ...data, items: [...data.items, { icon: 'Star', title: 'New Value', description: 'Description' }] });
    };

    const removeItem = (index: number) => {
        onChange({ ...data, items: data.items.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section Title</label>
                    <input type="text" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section Subtitle</label>
                    <input type="text" value={data.subtitle} onChange={e => onChange({ ...data, subtitle: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase">Grid Items</label>
                {data.items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <IconPicker value={item.icon} onChange={(val) => updateItem(index, 'icon', val)} />
                        <div className="flex-1 space-y-2">
                            <input type="text" value={item.title} onChange={e => updateItem(index, 'title', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm" placeholder="Title" />
                            <input type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" placeholder="Description" />
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-colors">+ Add Item</button>
            </div>
        </div>
    );
};

const ContactSectionEditor = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...data, items: newItems });
    };

    const addItem = () => {
        onChange({ ...data, items: [...data.items, { icon: 'Mail', label: 'Label', value: 'Value' }] });
    };

    const removeItem = (index: number) => {
        onChange({ ...data, items: data.items.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section Title</label>
                    <input type="text" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-800 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section Subtitle</label>
                    <input type="text" value={data.subtitle} onChange={e => onChange({ ...data, subtitle: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 focus:outline-none focus:border-emerald-500" />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase">Contact Items</label>
                {data.items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <IconPicker value={item.icon} onChange={(val) => updateItem(index, 'icon', val)} />
                        <div className="flex-1 space-y-2">
                            <input type="text" value={item.label} onChange={e => updateItem(index, 'label', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm" placeholder="Label (e.g. Phone)" />
                            <textarea value={item.value} onChange={e => updateItem(index, 'value', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono" placeholder="Value (e.g. +123...)" rows={2} />
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-emerald-400 hover:text-emerald-500 transition-colors">+ Add Item</button>
            </div>
        </div>
    );
};

const FaqContactEditor = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => {
    const updateFaq = (index: number, field: string, value: string) => {
        const newFaqs = [...data.faqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        onChange({ ...data, faqs: newFaqs });
    };

    const addFaq = () => {
        onChange({ ...data, faqs: [...data.faqs, { question: 'New Question?', answer: 'Answer here.' }] });
    };

    const removeFaq = (index: number) => {
        onChange({ ...data, faqs: data.faqs.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">FAQ Title</label>
                    <input type="text" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-800 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Form Title</label>
                    <input type="text" value={data.formTitle} onChange={e => onChange({ ...data, formTitle: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-emerald-600 focus:outline-none focus:border-emerald-500" />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase">FAQ Items</label>
                {data.faqs.map((faq: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 relative group">
                        <button type="button" onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <input type="text" value={faq.question} onChange={e => updateFaq(index, 'question', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-bold text-sm text-emerald-800" placeholder="Question" />
                        <textarea value={faq.answer} onChange={e => updateFaq(index, 'answer', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-emerald-500" placeholder="Answer" rows={2} />
                    </div>
                ))}
                <button type="button" onClick={addFaq} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-emerald-400 hover:text-emerald-500 transition-colors">+ Add FAQ</button>
            </div>
        </div>
    );
};
