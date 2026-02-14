import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface FeaturedCategorySidebarProps {
    title: string;
    products: Product[];
    viewAllLink: string;
    banner?: {
        title: string;
        description: string;
        imageUrl: string;
        buttonText: string;
        link: string;
    };
}

const FeaturedCategorySidebar: React.FC<FeaturedCategorySidebarProps> = ({
    title,
    products,
    viewAllLink,
    banner
}) => {
    const { addToCart } = useStore();
    const navigate = useNavigate();

    if (!products.length) return null;

    return (
        <section className="w-full py-6 md:py-10 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8 border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl md:text-3xl font-bold md:font-black text-slate-800 tracking-tight capitalize md:uppercase">{title}</h2>
                        <Link
                            to={viewAllLink}
                            className="group flex items-center gap-2 text-[10px] md:text-xs font-bold md:font-black uppercase tracking-widest text-emerald-500 md:text-gray-500 hover:text-emerald-500 transition-colors"
                        >
                            View All Items
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="h-1 w-20 bg-emerald-500 mt-2 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-auto">
                    {/* Sidebar Banner */}
                    <div className="lg:col-span-1 relative group overflow-hidden rounded-2xl aspect-video lg:aspect-auto h-auto lg:h-auto shadow-xl">
                        {banner?.imageUrl ? (
                            <>
                                <img
                                    src={banner.imageUrl}
                                    alt={banner.title || title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-center items-center">
                                    {banner.description && (
                                        <span className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2">{banner.description}</span>
                                    )}
                                    <h3 className="text-3xl font-black text-white uppercase leading-none mb-6">{banner.title || title}</h3>

                                    <Link
                                        to={banner.link || viewAllLink}
                                        className="bg-emerald-500 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-1 w-auto md:w-full min-w-[120px]"
                                    >
                                        {banner.buttonText || 'Buy Now'}
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-gray-400 font-bold">
                                No Banner Image
                            </div>
                        )}
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.slice(0, 8).map(product => {
                                const isDiscounted = product.originalPrice !== undefined && product.originalPrice > product.price;

                                return (
                                    <div key={product.id} className="group flex flex-col items-center text-center">
                                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl mb-3 bg-gray-100">
                                            <Link to={`/product/${product.slug}`}>
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </Link>
                                        </div>

                                        <Link to={`/product/${product.slug}`} className="block mb-2">
                                            <h3 className="text-sm font-bold text-gray-800 hover:text-emerald-500 transition-colors line-clamp-1 px-1">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (product.variants && product.variants.length > 0) {
                                                    navigate(`/product/${product.slug}`);
                                                } else {
                                                    addToCart(product);
                                                }
                                            }}
                                            className="w-full bg-emerald-500 text-white text-[10px] md:text-xs font-black uppercase py-2.5 rounded-sm tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors mb-2"
                                        >
                                            Buy Now
                                        </button>

                                        <div className="flex items-center justify-center gap-2">
                                            {isDiscounted && (
                                                <span className="text-xs text-gray-400 line-through font-bold">
                                                    ৳{product.originalPrice?.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="text-sm md:text-base font-black text-gray-900">
                                                ৳{product.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedCategorySidebar;
