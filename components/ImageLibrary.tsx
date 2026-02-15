import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Check, Image as ImageIcon, Search } from 'lucide-react';

interface ImageLibraryProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ onSelect, onClose }) => {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const allImages = new Map<string, any>();

            // 1. Fetch Legacy Supabase Images
            const { data: storageData } = await supabase.storage.from('product-images').list('', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

            if (storageData) {
                storageData.forEach(item => {
                    if (item.name !== '.emptyFolderPlaceholder') {
                        const { data } = supabase.storage.from('product-images').getPublicUrl(item.name);
                        allImages.set(data.publicUrl, {
                            id: item.id || data.publicUrl,
                            name: item.name,
                            url: data.publicUrl,
                            source: 'Supabase',
                            timestamp: item.created_at ? new Date(item.created_at).getTime() : 0,
                        });
                    }
                });
            }

            // 2. Fetch from Database (Products, Banners, Blogs, Categories, HomeSections) to find Cloudinary/External images
            const [
                { data: products },
                { data: banners },
                { data: blogPosts },
                { data: categories },
                { data: homeSections },
                { data: storeSettings },
                { data: mediaHistory },
                { data: brands }
            ] = await Promise.all([
                supabase.from('products').select('images, variants, created_at'),
                supabase.from('banners').select('image_url, created_at'),
                supabase.from('blog_posts').select('imageUrl, created_at'),
                supabase.from('categories').select('image, created_at'),
                supabase.from('home_sections').select('banner, gridBanners'),
                supabase.from('settings').select('value').eq('key', 'store_info').maybeSingle(),
                supabase.from('settings').select('value').eq('key', 'media_history').maybeSingle(),
                supabase.from('brands').select('logo_url, created_at')
            ]);

            // Helper to add image
            const addImage = (url?: string, timestamp?: string | number) => {
                if (!url) return;

                const ts = timestamp ? new Date(timestamp).getTime() : 0;

                // If exists, update timestamp if newer (only if we have a valid new timestamp)
                if (allImages.has(url)) {
                    if (ts > 0) {
                        const existing = allImages.get(url);
                        if (ts > (existing.timestamp || 0)) {
                            existing.timestamp = ts;
                        }
                    }
                    return;
                }

                // Try to extract name from URL
                let name = url;
                try {
                    const parts = url.split('/');
                    name = parts[parts.length - 1];
                } catch (e) { }

                allImages.set(url, {
                    id: url,
                    name: name,
                    url: url,
                    source: 'Database',
                    timestamp: ts
                });
            };

            // Process Products
            products?.forEach((p: any) => {
                if (Array.isArray(p.images)) p.images.forEach((img: string) => addImage(img, p.created_at));
                // Check variants
                if (Array.isArray(p.variants)) {
                    p.variants.forEach((v: any) => addImage(v.image, p.created_at));
                }
            });

            // Process Banners
            banners?.forEach((b: any) => addImage(b.image_url, b.created_at));

            // Process Blog Posts
            blogPosts?.forEach((b: any) => addImage(b.imageUrl, b.created_at));

            // Process Categories
            categories?.forEach((c: any) => addImage(c.image, c.created_at));

            // Process Home Sections
            homeSections?.forEach((s: any) => {
                if (s.banner && s.banner.imageUrl) {
                    addImage(s.banner.imageUrl);
                }
                if (Array.isArray(s.gridBanners)) {
                    s.gridBanners.forEach((b: any) => {
                        if (b.imageUrl) addImage(b.imageUrl);
                    });
                }
            });

            // Process Store Info (from Settings)
            if (storeSettings?.value) {
                addImage(storeSettings.value.logo_url);
                addImage(storeSettings.value.favicon_url);
            }

            // Process Brands
            brands?.forEach((b: any) => addImage(b.logo_url, b.created_at));

            // Process Media History (Global Library)
            // This is the most accurate source for recent uploads
            if (mediaHistory?.value && Array.isArray(mediaHistory.value)) {
                mediaHistory.value.forEach((img: any) => {
                    if (img.url) addImage(img.url, img.created_at);
                });
            }

            // Convert Map to Array and Sort by Timestamp (Newest First)
            const sortedImages = Array.from(allImages.values()).sort((a, b) => {
                // Prioritize items with timestamps
                const timeA = a.timestamp || 0;
                const timeB = b.timestamp || 0;
                return timeB - timeA;
            });

            setImages(sortedImages);

        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredImages = images.filter(img =>
        img.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <ImageIcon className="text-emerald-500" /> Media Library
                        </h3>
                        <p className="text-gray-400 text-sm font-medium">Select an image from your gallery</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Search Bar & Filter */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search images by filename..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent font-bold text-sm outline-none text-gray-700 placeholder:font-medium"
                    />
                </div>

                {/* content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-[50%] h-12 w-12 border-t-2 border-b-2 border-[#4F0343]"></div>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">No images found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredImages.map((img) => (
                                <div
                                    key={img.id}
                                    onClick={() => { onSelect(img.url); onClose(); }}
                                    className="group relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow-lg transition-all"
                                >
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all bg-white text-emerald-600 p-2 rounded-full shadow-lg">
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-gray-600 truncate border-t border-gray-100">
                                        {img.name}
                                    </div>
                                    {img.source === 'Supabase' && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow">Legacy</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white text-center text-xs font-bold text-gray-400">
                    Showing {filteredImages.length} images
                </div>
            </div>
        </div>
    );
};
