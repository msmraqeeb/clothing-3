import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

interface BannerSliderProps {
    banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const minSwipeDistance = 50;

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    if (banners.length === 0) return null;

    return (
        <div
            className="relative w-full overflow-hidden group bg-gray-100"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {banners.map((banner, idx) => (
                    <div key={banner.id} className="w-full flex-shrink-0 relative">
                        <img
                            src={banner.image_url}
                            alt={banner.title || 'Banner'}
                            className="w-full h-auto object-cover"
                        />


                        {/* Hero Overlay Text */}
                        <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-center p-4">
                            <div className={`transition-all duration-1000 transform ${currentSlide === idx ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                {banner.title && (
                                    <h2 className="text-2xl md:text-5xl lg:text-6xl font-thin text-white tracking-[0.2em] uppercase mb-2 drop-shadow-md">
                                        {banner.title}
                                    </h2>
                                )}
                                {banner.subtitle && (
                                    <h3 className="text-lg md:text-2xl lg:text-3xl font-signature text-white mb-6 md:mb-8 drop-shadow-md">
                                        {banner.subtitle}
                                    </h3>
                                )}

                                {banner.buttonText && (
                                    <Link
                                        to={banner.link || '/products'}
                                        className="inline-block bg-emerald-500 text-white px-6 py-2 md:px-8 md:py-3 text-xs md:text-sm font-bold tracking-widest hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-colors duration-300 rounded-full"
                                    >
                                        {banner.buttonText}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 hover:bg-white text-white hover:text-black transition-all rounded-full group-hover:opacity-100 opacity-0"
                    >
                        <ChevronLeft size={28} strokeWidth={1} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 hover:bg-white text-white hover:text-black transition-all rounded-full group-hover:opacity-100 opacity-0"
                    >
                        <ChevronRight size={28} strokeWidth={1} />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1 transition-all duration-300 ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/40 w-4 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerSlider;
