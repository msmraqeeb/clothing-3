import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FeaturedCollectionScrollProps {
    title: string;
    description?: string;
    link?: string;
    products: Product[];
    backgroundColor?: string;
}

const FeaturedCollectionScroll: React.FC<FeaturedCollectionScrollProps> = ({
    title,
    description,
    link = '/products',
    products,
    backgroundColor = '#4F0343'
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // Dynamic scroll amount based on current item width
            const itemWidth = container.children[0]?.clientWidth || 0;
            const gap = 16; // gap-4 is 1rem = 16px
            const scrollAmount = itemWidth + gap;

            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="w-full px-4 py-2 md:py-8">
            <div
                className="flex flex-col lg:flex-row h-auto lg:h-[600px] rounded-md overflow-hidden shadow-xl"
                style={{ backgroundColor }}
            >
                {/* Left Panel - Info */}
                <div
                    className="lg:w-[22%] p-8 flex flex-col justify-center relative text-white"
                >
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                        {title}
                    </h2>

                    {description && (
                        <p className="text-white/80 text-sm mb-8 leading-relaxed">
                            {description}
                        </p>
                    )}

                    <Link
                        to={link}
                        className="inline-flex items-center justify-center w-10 h-10 bg-white text-gray-900 rounded-full hover:scale-105 transition-transform duration-300"
                    >
                        <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Right Panel - Product Scroll */}
                <div className="lg:w-[78%] relative flex flex-col justify-center h-full py-4 pr-4">

                    {/* Navigation Buttons - Absolute Center */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-[#5f1353] hover:bg-[#7a186b] flex items-center justify-center text-white transition-all shadow-md border border-white/10"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-8 h-8 rounded-full bg-[#5f1353] hover:bg-[#7a186b] flex items-center justify-center text-white transition-all shadow-md border border-white/10 mr-4"
                    >
                        <ArrowRight size={16} />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 h-full items-center scrollbar-hide snap-x px-2"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {products.map(product => (
                            <div key={product.id} className="w-[calc(50%-8px)] md:w-[calc(25%-12px)] h-full snap-center flex-shrink-0">
                                <ProductCard product={product} variant="scroll" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollectionScroll;
