
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface FeaturedCategoriesGridProps {
    items: {
        title: string;
        subtitle?: string;
        imageUrl: string;
        link: string;
        categoryId?: string;
    }[];
    categories: Category[];
}

const FeaturedCategoriesGrid: React.FC<FeaturedCategoriesGridProps> = ({ items, categories }) => {
    // We need exactly 4 items for the design, or at least we render what we have up to 4
    const displayItems = items.slice(0, 4);

    const getProductCount = (catId?: string) => {
        if (!catId) return 0;
        const cat = categories.find(c => c.id === catId || c.slug === catId || c.name === catId);
        return cat ? cat.itemCount : 0;
    };

    if (displayItems.length === 0) return null;

    return (
        <section className="w-full px-2 md:px-4 py-8 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {displayItems.map((item, idx) => (
                    <Link
                        to={item.link}
                        key={idx}
                        className="group relative flex flex-col items-center bg-gray-50 overflow-hidden h-[300px] md:h-[450px] w-full"
                    >
                        {/* Image Containment - Centered and filling space */}
                        <div className="flex-1 w-full relative flex items-center justify-center p-4 pb-16 md:p-8 md:pb-20">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Bottom Floating Card */}
                        <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 bg-white py-3 px-3 md:py-5 md:px-6 shadow-xl z-20 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border-b-4 border-transparent group-hover:border-[#4F0343] text-center rounded-sm">
                            <h3 className="text-xs md:text-lg font-black uppercase tracking-tight text-gray-900 mb-0.5 md:mb-1">
                                {item.title}
                            </h3>
                            <p className="text-[10px] md:text-[11px] font-bold text-[#4F0343]">
                                {getProductCount(item.categoryId)} Products
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default FeaturedCategoriesGrid;
