import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ThreeColumnBannersProps {
    banners: {
        title: string;
        imageUrl: string;
        link: string;
    }[];
}

const ThreeColumnBanners: React.FC<ThreeColumnBannersProps> = ({ banners }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic for mobile
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scrollInterval = setInterval(() => {
            // Only scroll if we are in mobile view (width < 768px check or just scroll capability)
            // We check if scrollWidth > clientWidth to know if scrolling is possible
            if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
                const itemWidth = scrollContainer.clientWidth;
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

                // If we are near the end, scroll back to start
                if (scrollContainer.scrollLeft >= maxScroll - 10) {
                    scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
                }
            }
        }, 3000); // 3 seconds per slide

        return () => clearInterval(scrollInterval);
    }, []);

    if (!banners || banners.length === 0) return null;

    // Ensure we display up to 3 banners
    const displayBanners = banners.slice(0, 3);

    return (
        <section className="w-full py-6 md:py-10 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto md:grid md:grid-cols-3 gap-0 md:gap-6 snap-x snap-mandatory scroll-smooth no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {displayBanners.map((banner, index) => (
                        <div key={index} className="w-full flex-shrink-0 md:w-auto snap-center pl-2 pr-2 md:p-0 first:pl-0 last:pr-0">
                            <Link
                                to={banner.link || '#'}
                                className="group relative block overflow-hidden rounded-3xl w-full aspect-square md:aspect-[3/4] lg:aspect-square"
                            >
                                <div className="w-full h-full overflow-hidden">
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none"></div>

                                {/* Title Overlay at bottom-center or center based on the provided image style, 
                  the user image shows bottom centered text. */}
                                <div className="absolute bottom-8 left-0 right-0 text-center z-10 p-4">
                                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg transform transition-transform duration-300 group-hover:-translate-y-2">
                                        {banner.title}
                                    </h3>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ThreeColumnBanners;
