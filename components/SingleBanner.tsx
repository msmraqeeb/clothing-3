import React from 'react';
import { Link } from 'react-router-dom';

interface SingleBannerProps {
    banner: {
        title: string;
        description: string;
        imageUrl: string;
        buttonText: string;
        link: string;
    };
}

const SingleBanner: React.FC<SingleBannerProps> = ({ banner }) => {
    if (!banner || !banner.imageUrl) return null;

    return (
        <section className="w-full py-10 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <Link
                    to={banner.link || '#'}
                    className="group relative block w-full overflow-hidden rounded-2xl shadow-lg"
                >
                    <div className="w-full overflow-hidden">
                        <img
                            src={banner.imageUrl}
                            alt={banner.title || 'Banner'}
                            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Optional Overlay if title/desc are present */}
                    {(banner.title || banner.description) && (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex flex-col items-center justify-center text-center p-4">
                            {banner.description && (
                                <span className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md">
                                    {banner.description}
                                </span>
                            )}
                            {banner.title && (
                                <h3 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-xl mb-6">
                                    {banner.title}
                                </h3>
                            )}
                            {banner.buttonText && (
                                <span className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors">
                                    {banner.buttonText}
                                </span>
                            )}
                        </div>
                    )}
                </Link>
            </div>
        </section>
    );
};

export default SingleBanner;
