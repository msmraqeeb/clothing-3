import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

interface ProductSliderProps {
    title: string;
    subtitle?: string;
    products: Product[];
    viewAllLink?: string;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ title, subtitle, products, viewAllLink }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activePageIndex, setActivePageIndex] = React.useState(0);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350; // Approx card width + gap
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (products.length === 0) return null;

    return (
        <section className="w-full py-6 md:py-8 bg-white relative z-20">
            <div className="w-full px-2 md:px-4">
                <div className="flex flex-col items-center justify-center mb-8 relative">
                    <div className="text-center space-y-2 mb-2">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">{title}</h2>
                        {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-4 absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex">
                        {viewAllLink && (
                            <Link to={viewAllLink} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-emerald-500 transition-colors">
                                View All <ArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="relative group">
                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 hover:bg-white hover:text-emerald-500 border-transparent hover:border-emerald-500 bg-emerald-500 text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 hover:bg-white hover:text-emerald-500 border-transparent hover:border-emerald-500 bg-emerald-500 text-white"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        onScroll={() => {
                            if (scrollContainerRef.current) {
                                const { scrollLeft, clientWidth } = scrollContainerRef.current;
                                setActivePageIndex(Math.round(scrollLeft / clientWidth));
                            }
                        }}
                        className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map(product => (
                            <div key={product.id} className="w-[calc(50%-8px)] md:w-[calc(25%-12px)] flex-none snap-start">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Pagination Dots */}
                    <div className="mt-4 md:hidden flex justify-center items-center gap-2">
                        {Array.from({ length: Math.ceil(products.length / 2) }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (scrollContainerRef.current) {
                                        scrollContainerRef.current.scrollTo({
                                            left: idx * scrollContainerRef.current.clientWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                className={`transition-all duration-300 rounded-full ${activePageIndex === idx
                                    ? 'w-8 h-2.5 bg-emerald-500'
                                    : 'w-2.5 h-2.5 border border-emerald-500 bg-transparent'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductSlider;
