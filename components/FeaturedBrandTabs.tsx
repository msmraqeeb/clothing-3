import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Heart, ShoppingCart, Eye } from 'lucide-react';

interface FeaturedBrandTabsProps {
    title: string;
    brandNames: string[];
}

const FeaturedBrandTabs: React.FC<FeaturedBrandTabsProps> = ({ title, brandNames }) => {
    const { products, addToCart, toggleWishlist, wishlist } = useStore();
    const [activeBrand, setActiveBrand] = useState<string>(brandNames?.[0] || '');

    useEffect(() => {
        if (brandNames && brandNames.length > 0 && !activeBrand) {
            setActiveBrand(brandNames[0]);
        }
    }, [brandNames]);

    // If no brands are configured, don't render
    if (!brandNames || brandNames.length === 0) return null;

    // Filter products for the active brand
    const displayProducts = products
        .filter(p => p.brand === activeBrand)
        .slice(0, 10); // Increased limit for slider

    return (
        <section className="w-full py-6 md:py-10 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-6">
                        {title}
                    </h2>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {brandNames.map((brand) => (
                            <button
                                key={brand}
                                onClick={() => setActiveBrand(brand)}
                                className={`px-6 py-2 rounded-none border border-gray-200 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeBrand === brand
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid / Slider */}
                {displayProducts.length > 0 ? (
                    <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-5 md:gap-6 snap-x scroll-smooth no-scrollbar">
                        {displayProducts.map((product) => (
                            <div key={product.id} className="min-w-[45%] md:min-w-0 snap-center group relative bg-white border border-gray-100 p-3 hover:shadow-xl transition-all duration-300">
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3">
                                    <Link to={`/product/${product.slug}`}>
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </Link>
                                    {/* Badges */}
                                    {product.badge && (
                                        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10">
                                            {product.badge}
                                        </span>
                                    )}
                                    {/* Hover Actions */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                                            className={`p-2 rounded-full shadow-lg transition-colors ${wishlist.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-800 hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500'}`}
                                        >
                                            <Heart size={16} className={wishlist.includes(product.id) ? 'fill-current' : ''} />
                                        </button>
                                        <Link
                                            to={`/product/${product.slug}`}
                                            className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-sm font-bold text-gray-800 mb-1 truncate group-hover:text-emerald-500 transition-colors">
                                        <Link to={`/product/${product.slug}`}>{product.name}</Link>
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-xs text-gray-400 line-through">৳{product.originalPrice}</span>
                                        )}
                                        <span className="text-sm font-bold text-emerald-500">৳{product.price}</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full bg-emerald-500 text-white text-xs font-bold uppercase py-2 tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No products found for {activeBrand}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedBrandTabs;
