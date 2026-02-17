import React, { useState, useMemo } from 'react';
import { Product, Order, CartItem } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductSlider from './ProductSlider';

interface FeaturedProductTabsProps {
    title: string;
    products: Product[];
    orders: Order[];
}

type TabType = 'NEW ARRIVAL' | 'ON SALE' | 'BEST SELLING';

const FeaturedProductTabs: React.FC<FeaturedProductTabsProps> = ({ title, products, orders }) => {
    const [activeTab, setActiveTab] = useState<TabType>('NEW ARRIVAL');

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (activeTab === 'NEW ARRIVAL') {
            // Sort by date descending
            result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        } else if (activeTab === 'ON SALE') {
            // Filter for products where originalPrice > price
            result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
        } else if (activeTab === 'BEST SELLING') {
            // Calculate sales frequency from orders
            const salesCount: { [key: string]: number } = {};
            orders.forEach(order => {
                order.items.forEach((item: CartItem) => {
                    // Handle variant IDs or base IDs
                    salesCount[item.id] = (salesCount[item.id] || 0) + item.quantity;
                });
            });

            result = result.filter(p => (salesCount[p.id] || 0) > 0);
            result.sort((a, b) => (salesCount[b.id] || 0) - (salesCount[a.id] || 0));
        }

        return result.slice(0, 8);
    }, [products, orders, activeTab]);

    return (
        <section className="w-full py-4 md:py-12 bg-white">
            <div className="w-full px-2 md:px-4">
                <div className="flex flex-col items-center justify-center mb-8">
                    {/* Render Title only if provided, else keep header simple */}
                    {title && <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 mb-6">{title}</h2>}

                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {(['NEW ARRIVAL', 'ON SALE', 'BEST SELLING'] as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-xs md:text-sm font-bold uppercase tracking-widest border transition-all duration-300 rounded-none ${activeTab === tab
                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-500 hover:text-emerald-500'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <ProductSliderInternal products={filteredProducts} />
            </div>
        </section>
    );
};

// Internal Slider Component (Simplified version of ProductSlider for reuse)
const ProductSliderInternal: React.FC<{ products: Product[] }> = ({ products }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [activePageIndex, setActivePageIndex] = React.useState(0);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350;
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (products.length === 0) return <div className="text-center py-10 text-gray-400">No products found.</div>;

    return (
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
    );
}

export default FeaturedProductTabs;
