import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Headphones, ShieldCheck, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BannerSlider from '../components/BannerSlider';
import ProductSlider from '../components/ProductSlider';
import { CategoryGrid } from '../components/CategoryGrid';
import FeaturedProductTabs from '../components/FeaturedProductTabs';
import FeaturedCategorySidebar from '../components/FeaturedCategorySidebar';
import ThreeColumnBanners from '../components/ThreeColumnBanners';
import SingleBanner from '../components/SingleBanner';
import FeaturedBrandTabs from '../components/FeaturedBrandTabs';
import FeaturedCategoriesGrid from '../components/FeaturedCategoriesGrid';
import FeaturedProductGrid from '../components/FeaturedProductGrid';
import FeaturedCollectionScroll from '../components/FeaturedCollectionScroll';
import BrandLogoSlider from '../components/BrandLogoSlider';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

const Home: React.FC = () => {
  const { products, banners, homeSections, categories, orders } = useStore();


  const homeBanners = useMemo(() => {
    return banners
      .filter(b => b.type === 'home_banner')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [banners]);

  const sortedSections = useMemo(() => {
    return homeSections
      .filter(s => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [homeSections]);

  const getSectionProducts = (section: any) => {
    let filtered = [...products];

    if (section.filterType === 'category' && section.filterValue) {
      const filterVal = String(section.filterValue || '').toLowerCase().trim();

      // 1. Find the root category
      const targetCategory = categories.find(c =>
        String(c.id).toLowerCase() === filterVal ||
        (c.slug || '').toLowerCase() === filterVal ||
        (c.name || '').toLowerCase() === filterVal
      );

      // 2. Build family list (Root + Children + Grandchildren)
      const allowedCategories = new Set<string>();

      if (targetCategory) {
        allowedCategories.add(targetCategory.name.toLowerCase());

        // Recursive finder using IDs
        const findDescendants = (parentId: string) => {
          const children = categories.filter(c => c.parentId === parentId);
          children.forEach(child => {
            allowedCategories.add(child.name.toLowerCase());
            findDescendants(child.id);
          });
        };
        findDescendants(targetCategory.id);
      } else {
        allowedCategories.add(filterVal);
      }

      // 3. Filter products matching any allowed category
      filtered = filtered.filter(p => allowedCategories.has((p.category || '').toLowerCase()));
    } else if (section.filterType === 'sale') {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    } else if (section.filterType === 'featured') {
      filtered = filtered.filter(p => p.isFeatured);
    }

    return filtered.slice(0, 12); // Limit to 12 for performance/layout
  };

  return (
    <div className="w-full bg-white pb-20">
      {/* Hero Section */}
      {/* Hero Section - Split Layout */}
      <section className="w-full relative px-2 md:px-4 pt-4 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 h-auto lg:h-[500px] xl:h-[600px]">
          {/* Left Column: Main Slider (66%) */}
          <div className="lg:col-span-2 h-[300px] md:h-[400px] lg:h-full rounded-2xl overflow-hidden shadow-sm relative">
            {banners.filter(b => b.type === 'slider').length > 0 ? (
              <BannerSlider banners={banners.filter(b => b.type === 'slider').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))} />
            ) : (
              <div className="w-full h-full relative bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000"
                  alt="Fashion Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-center bg-white/90 p-6 md:p-10 rounded-2xl backdrop-blur-sm shadow-xl">
                    <h1 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tighter text-emerald-950">New Collection</h1>
                    <p className="text-sm md:text-lg uppercase tracking-widest text-emerald-800 font-bold">Discover the latest trends</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 2x2 Grid (33%) */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-rows-2 gap-2 md:gap-4 h-auto lg:h-full">
            {banners.filter(b => b.type === 'hero_grid').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).slice(0, 4).map((banner) => (
              <Link to={banner.link || '#'} key={banner.id} className="relative group overflow-hidden rounded-2xl block w-full h-auto lg:h-full shadow-sm border border-gray-100">
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Offer'}
                  className="w-full h-auto lg:h-full object-contain lg:object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Optional Text Overlay */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3 md:p-4 opacity-100 transition-opacity duration-300">
                    {banner.title && <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight leading-none mb-0.5">{banner.title}</h3>}
                    {banner.subtitle && <p className="text-[10px] md:text-xs font-bold text-gray-200 uppercase tracking-wider">{banner.subtitle}</p>}
                  </div>
                )}
              </Link>
            ))}
            {/* Fallback placeholders if not enough banners */}
            {Array.from({ length: Math.max(0, 4 - banners.filter(b => b.type === 'hero_grid').length) }).map((_, idx) => (
              <div key={`placeholder-${idx}`} className="relative bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center p-4">
                <div className="text-center">
                  <span className="block text-2xl mb-1">📷</span>
                  <span className="text-[10px] uppercase font-black text-gray-400">Add Hero Grid Banner</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Banners (First 3) */}
      {homeBanners.length > 0 && (
        <section className="w-full px-2 md:px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            {homeBanners.slice(0, 3).map((banner) => (
              <Link to={banner.link || '#'} key={banner.id} className="relative group overflow-hidden block">
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-auto md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center p-4">
                    {banner.title && (
                      <h3 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-white drop-shadow-lg text-center leading-tight">
                        {banner.title}
                      </h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-sm md:text-lg font-bold uppercase tracking-widest text-white/90 mt-2 drop-shadow-md">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mosaic Banners (4, 5, 6, 7) */}
      {homeBanners.length >= 4 && (
        <section className="w-full px-2 md:px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[611px_1fr] gap-2 h-auto lg:h-[800px]">
            {/* Left Column: Banner 4 */}
            {homeBanners[3] && (
              <Link to={homeBanners[3].link || '#'} className="relative group overflow-hidden h-auto lg:h-full block">
                <img src={homeBanners[3].image_url} alt={homeBanners[3].title} className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {(homeBanners[3].title || homeBanners[3].subtitle) && (
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center p-4">
                    {homeBanners[3].title && <h3 className="text-3xl lg:text-5xl font-black uppercase text-white drop-shadow-lg text-center">{homeBanners[3].title}</h3>}
                    {homeBanners[3].subtitle && <p className="text-sm lg:text-xl font-bold uppercase text-white/90 mt-2 drop-shadow-md">{homeBanners[3].subtitle}</p>}
                  </div>
                )}
              </Link>
            )}

            {/* Right Column */}
            <div className="flex flex-col gap-2 h-auto lg:h-full">
              {/* Top Row: Banner 5 & 6 */}
              <div className="grid grid-cols-2 gap-2 h-auto lg:h-1/2">
                {[homeBanners[4], homeBanners[5]].map((banner, idx) => (
                  banner && (
                    <Link to={banner.link || '#'} key={banner.id} className="relative group overflow-hidden block h-full">
                      <img src={banner.image_url} alt={banner.title} className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {(banner.title || banner.subtitle) && (
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center p-4">
                          {banner.title && <h3 className="text-xl lg:text-3xl font-black uppercase text-white drop-shadow-lg text-center">{banner.title}</h3>}
                          {banner.subtitle && <p className="text-xs lg:text-sm font-bold uppercase text-white/90 mt-2 drop-shadow-md">{banner.subtitle}</p>}
                        </div>
                      )}
                    </Link>
                  )
                ))}
              </div>
              {/* Bottom Row: Banner 7 */}
              <div className="h-auto lg:h-1/2">
                {homeBanners[6] && (
                  <Link to={homeBanners[6].link || '#'} className="relative group overflow-hidden block h-auto lg:h-full">
                    <img src={homeBanners[6].image_url} alt={homeBanners[6].title} className="w-full h-auto lg:h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {(homeBanners[6].title || homeBanners[6].subtitle) && (
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center p-4">
                        {homeBanners[6].title && <h3 className="text-2xl lg:text-4xl font-black uppercase text-white drop-shadow-lg text-center">{homeBanners[6].title}</h3>}
                        {homeBanners[6].subtitle && <p className="text-sm lg:text-lg font-bold uppercase text-white/90 mt-2 drop-shadow-md">{homeBanners[6].subtitle}</p>}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Home Sections (Sliders) */}
      {sortedSections.map(section => {
        if (section.type === 'slider') {
          return (
            <ProductSlider
              key={section.id}
              title={section.title}
              products={getSectionProducts(section)}
              viewAllLink={section.filterType === 'category' ? `/products?category=${encodeURIComponent((section.filterValue || '').toLowerCase())}` : '/products'}
            />
          );
        } else if (section.type === 'tabbed-slider') {
          return (
            <FeaturedProductTabs
              key={section.id}
              title={section.title}
              products={products}
              orders={orders}
            />
          );
        } else if (section.type === 'category-grid') {
          return (
            <CategoryGrid
              key={section.id}
              title={section.title}
              categoryIds={section.categoryIds}
            />
          );
        } else if (section.type === 'featured-category-sidebar') {
          return (
            <FeaturedCategorySidebar
              key={section.id}
              title={section.title}
              products={getSectionProducts(section)}
              viewAllLink={section.filterType === 'category' ? `/products?category=${encodeURIComponent((section.filterValue || '').toLowerCase())}` : '/products'}
              banner={section.banner}
            />
          );
        } else if (section.type === 'three-column-banners' && section.gridBanners) {
          return (
            <ThreeColumnBanners key={section.id} banners={section.gridBanners} />
          );
        } else if (section.type === 'single-banner' && section.banner) {
          return (
            <SingleBanner key={section.id} banner={section.banner} />
          );
        } else if (section.type === 'brand-tabs') {
          return (
            <FeaturedBrandTabs key={section.id} title={section.title} brandNames={section.brandNames || []} />
          );
        } else if (section.type === 'brand-logos') {
          return (
            <BrandLogoSlider key={section.id} title={section.title} brandNames={section.brandNames} />
          );
        } else if (section.type === 'featured-categories-grid' && section.gridBanners) {
          return (
            <FeaturedCategoriesGrid key={section.id} items={section.gridBanners} categories={categories} />
          );
        } else if (section.type === 'featured-collection-scroll' && section.banner) {
          return (
            <FeaturedCollectionScroll
              key={section.id}
              title={section.title}
              description={section.banner.description}
              link={section.banner.link}
              products={getSectionProducts(section)}
              backgroundColor={section.banner.imageUrl}
            />
          );
        } else if (section.type === 'featured-product-grid') {
          return (
            <FeaturedProductGrid
              key={section.id}
              title={section.title}
              products={getSectionProducts(section)}
              viewAllLink={section.banner?.link}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default Home;
