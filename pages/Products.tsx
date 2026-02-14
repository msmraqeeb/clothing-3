
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, ChevronDown, Search, RotateCcw, Check, Star, Coins, X } from 'lucide-react';
import { Category } from '../types';

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

const buildCategoryTree = (categories: Category[], parentId: string | null = null, level: number = 0): CategoryNode[] => {
  return categories
    .filter(cat => cat.parentId == parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id, level + 1),
      level
    }));
};

const CategorySidebarItem: React.FC<{
  category: CategoryNode;
  selectedCategory: string;
  onSelect: (slug: string) => void;
  selectedCategoryFamily: string[];
}> = ({ category, selectedCategory, onSelect, selectedCategoryFamily }) => {
  // Use slug for unique identification if available, fallback to name
  const categoryKey = category.slug || category.name;

  // Auto-expand if this category or any child is selected, or if it's a top-level parent of the selection
  const isSelected = selectedCategory === categoryKey;
  // Check if this category is in the active path (using slug/key)
  const isPathActive = selectedCategoryFamily.includes(categoryKey);

  const [isExpanded, setIsExpanded] = useState(isPathActive);

  // Update expansion when selection changes
  useEffect(() => {
    if (isPathActive) setIsExpanded(true);
  }, [isPathActive]);

  const hasChildren = category.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isSelected ? 'bg-[#4F0343]/5 text-[#4F0343]' : 'text-gray-600 hover:bg-gray-50'}`}
        onClick={() => onSelect(categoryKey)}
        style={{ paddingLeft: `${(category.level * 12) + 12}px` }}
      >
        <div className="flex items-center gap-2">
          {/* Only show leaf indicator if it's a child */}
          {category.level > 0 && !hasChildren && <div className="w-1.5 h-1.5 rounded-none bg-gray-300"></div>}
          <span className={`${isSelected ? 'font-bold' : ''}`}>{category.name}</span>
        </div>

        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`p-1 rounded-none hover:bg-gray-200 transition-colors ${isSelected ? 'text-[#4F0343]' : 'text-gray-400'}`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children.map(child => (
            <CategorySidebarItem
              key={child.id}
              category={child}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              selectedCategoryFamily={selectedCategoryFamily}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Products: React.FC = () => {
  const { products, categories, searchQuery, brands, reviews, attributes } = useStore();
  // selectedCategory now stores the SLUG (or name if slug missing), not just name
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Helper to find all descendant category names for a given parent name
  const selectedCategoryFamily = useMemo(() => {
    if (selectedCategory === 'all') return [];

    // Traverse upwards using ID/Slug to build the family path of IDs/Slugs
    const family: string[] = [selectedCategory];

    // Find current category object by unique slug/name match (Case Insensitive)
    let curr = categories.find(c => (c.slug || c.name).toLowerCase() === selectedCategory.toLowerCase());

    // Add ancestors
    while (curr && curr.parentId) {
      const parent = categories.find(c => c.id === curr!.parentId);
      if (parent) {
        family.push(parent.slug || parent.name);
        curr = parent;
      } else {
        break;
      }
    }

    return family;
  }, [selectedCategory, categories]);

  const location = useLocation();
  const navigate = useNavigate();

  // Sync URL category param with state
  // 1. Read from URL on mount/update
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const catParam = searchParams.get('category');
    if (catParam && catParam.toLowerCase() !== selectedCategory.toLowerCase()) {
      setSelectedCategory(decodeURIComponent(catParam));
    } else if (!catParam && selectedCategory !== 'all') {
      // If URL has no category but state does (e.g. back button to root), reset state? 
      // Or do we want to persist? Usually URL is truth.
      setSelectedCategory('all');
    }
  }, [location.search]);

  // 2. Helper to update URL (which triggers Step 1)
  const updateCategory = (newCategory: string) => {
    const searchParams = new URLSearchParams(location.search);
    if (newCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newCategory);
    }
    navigate({ search: searchParams.toString() }, { replace: true });
  };


  // Price Range Logic
  const [minMax, setMinMax] = useState<[number, number]>([0, 10000]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);



  // Initialize price range based on actual product data
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));

      // Only update if values actually changed to prevent infinite loop
      if (min !== minMax[0] || max !== minMax[1]) {
        setMinMax([min, max]);
        setPriceRange([min, max]);
      }
    }
  }, [products, minMax]);

  // Dynamic Attribute Logic
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory, selectedBrands, selectedMinRating, selectedAttributes, priceRange]);



  // Reset attributes when category changes to avoid stale filters
  useEffect(() => {
    setSelectedAttributes({});
  }, [selectedCategory]);

  const availableAttributes = useMemo(() => {
    const formatted: Record<string, string[]> = {};
    attributes.forEach(attr => {
      // Assuming attr.values is an array of objects { key, value } or similar, based on Context inspection
      // We need to map to strings. In StoreContext/Admin it looked like { id, value }
      if (Array.isArray(attr.values)) {
        formatted[attr.name] = attr.values.map((v: any) => v.value || v).sort();
      }
    });
    return formatted;
  }, [attributes]);

  const toggleAttribute = (attrName: string, value: string) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[attrName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newState = { ...prev, [attrName]: newValues };
      if (newValues.length === 0) delete newState[attrName];
      return newState;
    });
  };

  const filteredProducts = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const showSaleOnly = searchParams.get('filter') === 'sale';

    // Get all descendants for filtering products (we want to show products in subcategories too)
    // We need a separate list for filtering because 'selectedCategoryFamily' now includes ANCESTORS for UI expansion.
    // Pure descendants for filtering:
    const getDescendantsOnly = (catKey: string): string[] => {
      if (catKey === 'all') return [];

      // Find category by key (slug or name) - Case Insensitive
      const currentCat = categories.find(c => (c.slug || c.name).toLowerCase() === catKey.toLowerCase());
      if (!currentCat) return []; // If not found, return empty, but handled below

      // Return the NAME of the current category (because products store names)
      let names = [currentCat.name];

      // Find children by parentId
      const directChildren = categories.filter(c => c.parentId === currentCat.id);

      directChildren.forEach(child => {
        // Recursive call with child's slug/key
        names = [...names, ...getDescendantsOnly(child.slug || child.name)];
      });
      return names;
    };

    const filterCategories = selectedCategory === 'all' ? [] : getDescendantsOnly(selectedCategory);
    // Find the display name for the header - Case Insensitive
    const currentCategoryDisplayName = categories.find(c => (c.slug || c.name).toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory;

    return products.filter(p => {
      const searchMatch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter check: If 'all', pass. Else check if product category NAME is in the list of descendant names.
      const categoryMatch = selectedCategory === 'all' || filterCategories.includes(p.category);
      const brandMatch = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand));

      let ratingMatch = true;
      if (selectedMinRating !== null) {
        const prodReviews = reviews.filter(r => r.productId === p.id);
        const avg = prodReviews.length > 0 ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length : 0;
        ratingMatch = avg >= selectedMinRating;
      }

      const saleMatch = !showSaleOnly || (p.originalPrice !== undefined && p.originalPrice > p.price);

      // Price Match Logic
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];

      // Attribute Match Logic
      const attributeMatch = Object.entries(selectedAttributes).every(([attrName, selectedValues]) => {
        // Check in new attributes structure
        if (p.attributes) {
          const attr = p.attributes.find(a => a.name === attrName);
          if (attr && attr.options.some(opt => selectedValues.includes(opt))) {
            return true;
          }
        }

        // Fallback: Check in variants (legacy or if not in attributes)
        if (p.variants && p.variants.length > 0) {
          return p.variants.some(v =>
            v.attributeValues[attrName] && selectedValues.includes(v.attributeValues[attrName])
          );
        }

        return false;
      });

      return searchMatch && categoryMatch && brandMatch && ratingMatch && saleMatch && attributeMatch && priceMatch;
    });
  }, [products, searchQuery, selectedCategory, selectedBrands, selectedMinRating, reviews, location.search, categories, selectedAttributes, priceRange]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
      observer.disconnect();
    };
  }, [filteredProducts]);

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const resetFilters = () => {
    updateCategory('all');
    setSelectedBrands([]);
    setSelectedMinRating(null);
    setSelectedAttributes({});
    if (products.length > 0) {
      setPriceRange(minMax);
    } else {
      setPriceRange([0, 10000]);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className={`shrink-0 lg:w-72 lg:block transition-all duration-300 ${isMobileFilterOpen ? 'fixed inset-0 z-[100] bg-white p-6 overflow-y-auto' : 'hidden'}`}>
            {/* Mobile Close Button */}
            <div className="flex lg:hidden items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-wider">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-none hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={18} className="text-[#4F0343]" />
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-[#4F0343]/5 text-[#4F0343]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
                {categoryTree.map(cat => (
                  <CategorySidebarItem
                    key={cat.id}
                    category={cat}
                    selectedCategory={selectedCategory}
                    onSelect={updateCategory}
                    selectedCategoryFamily={selectedCategoryFamily}
                  />
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-[#4F0343]" />
                  Price Range
                </div>
                <span className="text-xs font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-none">
                  ৳{priceRange[0]} - ৳{priceRange[1]}
                </span>
              </h3>

              <div className="relative h-2 w-full bg-gray-100 rounded-none mb-6">
                {/* Track Fill */}
                <div
                  className="absolute h-full bg-[#4F0343] rounded-full"
                  style={{
                    left: `${((priceRange[0] - minMax[0]) / (minMax[1] - minMax[0])) * 100}%`,
                    right: `${100 - ((priceRange[1] - minMax[0]) / (minMax[1] - minMax[0])) * 100}%`
                  }}
                ></div>

                {/* Range Inputs */}
                <input
                  type="range"
                  min={minMax[0]}
                  max={minMax[1]}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                    setPriceRange([val, priceRange[1]]);
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#4F0343] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#4F0343] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer outline-none z-30"
                />
                <input
                  type="range"
                  min={minMax[0]}
                  max={minMax[1]}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                    setPriceRange([priceRange[0], val]);
                  }}
                  className="absolute w-full h-full top-0 left-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#4F0343] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#4F0343] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer outline-none z-40"
                />
              </div>

              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>৳{minMax[0]}</span>
                <span>৳{minMax[1]}</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#4F0343]" />
                Brands
              </h3>
              <div className="space-y-2">
                {brands.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No brands found</p>
                ) : (
                  brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => toggleBrand(brand.name)}
                          className="peer h-5 w-5 appearance-none rounded-none border-2 border-gray-200 checked:bg-[#4F0343] checked:border-[#4F0343] transition-all"
                        />
                        <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-[#4F0343] transition-colors">{brand.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Dynamic Attribute Filter */}
            {Object.entries(availableAttributes)
              .sort(([a], [b]) => {
                const priority = ['Size', 'Color'];
                const idxA = priority.indexOf(a);
                const idxB = priority.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
              })
              .map(([attrName, values]) => (
                <div key={attrName} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-none bg-[#4F0343]"></span>
                    {attrName}
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {values.map(val => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedAttributes[attrName]?.includes(val) || false}
                            onChange={() => toggleAttribute(attrName, val)}
                            className="peer h-5 w-5 appearance-none rounded-none border-2 border-gray-200 checked:bg-[#4F0343] checked:border-[#4F0343] transition-all"
                          />
                          <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[#4F0343] transition-colors">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

            {/* Rating Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Customer Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(stars => (
                  <button
                    key={stars}
                    onClick={() => setSelectedMinRating(stars)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${selectedMinRating === stars ? 'bg-[#4F0343]/5 text-[#4F0343]' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} className={i < stars ? "" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="font-medium">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-gray-400 hover:text-[#4F0343] bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <RotateCcw size={16} />
              Reset All Filters
            </button>
          </aside>

          {/* Product Listing Main Area */}
          <main className="flex-1 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm font-medium text-gray-500">
                Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> results
                {selectedCategory !== 'all' && <span> in <span className="text-black font-bold">{categories.find(c => (c.slug || c.name) === selectedCategory)?.name || selectedCategory}</span></span>}
              </p>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-black transition-colors"
                >
                  <SlidersHorizontal size={18} />
                </button>

                <div className="flex items-center gap-2 text-sm flex-1 md:flex-none justify-end">
                  <span className="text-gray-400 font-medium hidden sm:inline">Sort by:</span>
                  <select className="bg-gray-50 border border-gray-100 rounded-full px-4 py-2 font-bold text-gray-700 outline-none focus:border-black w-full sm:w-auto">
                    <option>Default Sorting</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Average Rating</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-none p-20 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-none flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-xs">We couldn't find any products matching your current filters. Try adjusting your selection!</p>
                <button onClick={resetFilters} className="mt-8 bg-emerald-500 text-white px-8 py-3 rounded-none font-bold hover:bg-white hover:text-emerald-500 border border-transparent hover:border-emerald-500 transition-all">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  {filteredProducts.slice(0, visibleCount).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div ref={observerTarget} className="h-10 w-full flex items-center justify-center">
                    <div className="animate-spin rounded-[50%] h-6 w-6 border-2 border-[#4F0343] border-t-transparent"></div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
