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
                            source: 'Supabase'
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
                { data: storeInfo }
            ] = await Promise.all([
                supabase.from('products').select('images, variants'),
                supabase.from('banners').select('image_url'),
                supabase.from('blog_posts').select('imageUrl'),
                supabase.from('categories').select('image'),
                supabase.from('home_sections').select('banner'),
                supabase.from('store_info').select('logo_url, favicon_url').single()
            ]);

            // Helper to add image
            const addImage = (url?: string) => {
                if (!url) return;
                // Normalize URL to prevent duplicates with different protocols or slight variations if needed
                // For now, strict string check is fine
                if (allImages.has(url)) return;

                // Try to extract name from URL
                let name = url;
                try {
                    const parts = url.split('/');
                    name = parts[parts.length - 1];
                    // Clean cloudinary version/params if possible, but filename is usually last
                } catch (e) { }

                allImages.set(url, {
                    id: url,
                    name: name,
                    url: url,
                    source: 'Database'
                });
            };

            // Process Products
            products?.forEach((p: any) => {
                if (Array.isArray(p.images)) p.images.forEach((img: string) => addImage(img));
                // Check variants
                if (Array.isArray(p.variants)) {
                    p.variants.forEach((v: any) => addImage(v.image));
                }
            });

            // Process Banners
            banners?.forEach((b: any) => addImage(b.image_url));

            // Process Blog Posts
            blogPosts?.forEach((b: any) => addImage(b.imageUrl));

            // Process Categories
            categories?.forEach((c: any) => addImage(c.image));

            // Process Home Sections
            homeSections?.forEach((s: any) => {
                if (s.banner && s.banner.imageUrl) {
                    addImage(s.banner.imageUrl);
                }
            });

            // Process Store Info
            if (storeInfo) {
                addImage(storeInfo.logo_url);
                addImage(storeInfo.favicon_url);
            }

            // Convert Map to Array
            setImages(Array.from(allImages.values()));

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
