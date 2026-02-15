import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ChevronRight } from 'lucide-react';

interface BrandLogoSliderProps {
    title?: string;
    brandNames?: string[];
}

const BrandLogoSlider: React.FC<BrandLogoSliderProps> = ({ title, brandNames }) => {
    const { brands } = useStore();

    // Filter brands that have a logo
    let brandsWithLogos = brands.filter(b => b.logo_url);

    // If specific brands are selected, filter by them
    if (brandNames && brandNames.length > 0) {
        brandsWithLogos = brandsWithLogos.filter(b => brandNames.includes(b.name));
    }

    if (brandsWithLogos.length === 0) return null;

    return (
        <section className="w-full py-8 bg-white border-b border-gray-50">
            <div className="w-full px-2 md:px-4">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-lg md:text-xl font-black text-emerald-950 uppercase tracking-tight">
                        {title || 'Our Brands'}
                    </h2>
                </div>

                <div className="relative">
                    <div className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar snap-x py-2 px-2">
                        {brandsWithLogos.map((brand) => (
                            <Link
                                key={brand.id}
                                to={`/products?brand=${encodeURIComponent(brand.name)}`}
                                className="min-w-[45%] md:min-w-[calc(16.666%-1rem)] h-32 md:h-40 border border-gray-100 bg-[#ffffff] rounded-lg flex items-center justify-center p-6 transition-all duration-300 group snap-center hover:bg-white hover:border-gray-100 shadow-none hover:shadow-none"
                            >
                                <img
                                    src={brand.logo_url}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandLogoSlider;
