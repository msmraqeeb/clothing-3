import React from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface CategoryGridProps {
    title: string;
    categoryIds?: string[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ title, categoryIds = [] }) => {
    const { categories, products } = useStore();

    // Filter categories based on IDs, preserve order of selection if possible or just filter
    // Since IDs is just an array, simple filter works. 
    // If we want to Sort by the order in categoryIds, we can do that.
    const selectedCategories = categoryIds.length > 0
        ? categories.filter(c => categoryIds.includes(c.id))
            .sort((a, b) => categoryIds.indexOf(a.id) - categoryIds.indexOf(b.id))
        : [];

    if (!selectedCategories.length) return null;

    const getProductCount = (catName: string) => {
        return products.filter(p => p.category === catName).length;
    };

    return (
        <section className="py-6 md:py-10 bg-white">
            <div className="max-w-7xl mx-auto px-6">


                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-16 pb-12">
                    {selectedCategories.map(cat => (
                        <Link to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`} key={cat.id} className="group relative flex flex-col items-center">
                            {/* Image Container */}
                            <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-md">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold uppercase tracking-widest">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                            </div>

                            {/* Floating Text Content - Half in / Half out */}
                            <div className="absolute bottom-0 translate-y-1/2 w-[85%] bg-white/60 backdrop-blur-sm p-4 shadow-lg rounded-xl border border-white/50 group-hover:border-emerald-600 transition-all text-center z-10">
                                <h3 className="text-sm md:text-base font-black text-gray-900 group-hover:text-emerald-500 uppercase tracking-tighter mb-1 line-clamp-1 transition-colors">
                                    {cat.name}
                                </h3>
                                <div className="flex justify-center items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{getProductCount(cat.name)} Items</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
