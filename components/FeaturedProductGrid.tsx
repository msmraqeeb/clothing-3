import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductGridProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

const FeaturedProductGrid: React.FC<FeaturedProductGridProps> = ({
    title,
    products,
    viewAllLink = '/products'
}) => {
    if (!products || products.length === 0) return null;

    // First product for the left, major feature
    const mainProduct = products[0];
    // Next 8 products for the grid (4x2)
    const gridProducts = products.slice(1, 9);

    return (
        <section className="w-full px-4 py-8 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{title}</h2>
                {viewAllLink && (
                    <Link to={viewAllLink} className="text-sm font-medium text-gray-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                        View All <ArrowRight size={16} />
                    </Link>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Left Column - Large Featured Product */}
                <div className="lg:w-[35%] xl:w-[30%] flex-shrink-0">
                    <div className="h-full border border-gray-200 rounded-sm p-4 bg-white hover:shadow-lg transition-shadow duration-300">
                        <Link to={`/product/${mainProduct.slug}`} className="block h-full flex flex-col">
                            <div className="relative w-full flex-1 overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                                <img
                                    src={mainProduct.images?.[0]}
                                    alt={mainProduct.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                                />
                                {mainProduct.originalPrice && mainProduct.originalPrice > mainProduct.price && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase">
                                        Sale
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{mainProduct.name}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl font-bold text-emerald-700">৳{mainProduct.price.toLocaleString()}</span>
                                    {mainProduct.originalPrice && mainProduct.originalPrice > mainProduct.price && (
                                        <span className="text-sm text-gray-400 line-through">৳{mainProduct.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Right Column - 4x2 Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
                        {gridProducts.map(product => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                        {/* Fillers if not enough products to maintain grid shape? Optional. */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProductGrid;
