
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Product, Category, Order, CartItem, AdminTab, Attribute, Variant, Brand, Coupon, ShippingSettings, Review, UserProfile, Address, StoreInfo, Page, Banner, HomeSection, BlogPost } from '../types';
import { supabase } from '../lib/supabase';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  attributes: Attribute[];
  coupons: Coupon[];
  reviews: Review[];
  users: UserProfile[];
  addresses: Address[];
  pages: Page[];
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'date'>) => Promise<void>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;

  deleteBanner: (id: string) => Promise<void>;

  homeSections: HomeSection[];
  addHomeSection: (section: HomeSection) => Promise<void>;
  updateHomeSection: (id: string, section: HomeSection) => Promise<void>;
  deleteHomeSection: (id: string) => Promise<void>;

  wishlist: string[];
  user: any | null;
  userProfile: UserProfile | null;
  shippingSettings: ShippingSettings;
  storeInfo: StoreInfo;
  updateStoreInfo: (info: StoreInfo) => Promise<void>;
  appliedCoupon: Coupon | null;
  cart: CartItem[];
  isAdmin: boolean;
  adminTab: AdminTab;
  isCartOpen: boolean;
  loading: boolean;
  setAdminTab: (tab: AdminTab) => void;
  toggleAdmin: () => void;
  addToCart: (product: Product, variant?: Variant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  placeOrder: (customerDetails: any) => Promise<Order>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<void>;
  updateShippingSettings: (settings: ShippingSettings) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (categoryData: any) => Promise<void>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addBrand: (brandData: Omit<Brand, 'id'>) => Promise<void>;
  updateBrand: (id: string, brandData: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addAttribute: (name: string, values: any[]) => Promise<void>;
  updateAttribute: (id: string, name: string, values: any[]) => Promise<void>;
  deleteAttribute: (id: string) => Promise<void>;
  addCoupon: (couponData: any) => Promise<void>;
  updateCoupon: (id: string, couponData: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
  addReview: (reviewData: any) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  replyToReview: (id: string, reply: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'customer') => Promise<void>;
  updateProfile: (id: string, fullName: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  addAddress: (data: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, data: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  addPage: (page: Omit<Page, 'id' | 'createdAt'>) => Promise<void>;
  updatePage: (id: string, page: Partial<Page>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  superAdminName: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const SUPER_ADMIN_EMAIL = 'msmraqeeb@gmail.com';

const generateSlug = (name: string) => {
  return name.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ensureUniqueSlug = (items: { slug?: string }[], baseSlug: string): string => {
  let counter = 1;
  let newSlug = baseSlug;
  // Check against existing items (case-insensitive check for robustness)
  while (items.some(item => (item.slug || '').toLowerCase() === newSlug.toLowerCase())) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }
  return newSlug;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([
    {
      id: 'hot-sale',
      title: "Today's Hot Sale",
      type: 'slider',
      filterType: 'sale',
      sortOrder: 1,
      isActive: true
    },
    {
      id: 'popular-items',
      title: "Popular Items",
      type: 'grid',
      filterType: 'all',
      sortOrder: 2,
      isActive: true,
      banner: {
        title: "100% Fresh Vegetables and Authentic Products",
        description: "Get the best quality products at the most affordable prices.",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
        buttonText: "Shop Now",
        link: "/products"
      }
    }
  ]);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({ insideDhaka: 80, outsideDhaka: 150 });
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Bostro',
    address: '1418 River Drive, Suite 35, Cottonhall, CA 96222',
    phone: '+0 123 456 789',
    email: 'support@bostro.com',
    socials: {},
    floatingWidget: {
      isVisible: true,
      whatsapp: '',
      messenger: '',
      facebook: '',
      instagram: '',
      phone: '',
      supportImage: ''
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appliedCoupon');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [superAdminName, setSuperAdminName] = useState('Admin');

  const isAdmin = userProfile?.role === 'admin' || user?.email === SUPER_ADMIN_EMAIL;

  const mapProduct = (p: any): Product => ({
    id: String(p.id),
    name: String(p.name || ''),
    price: Number(p.price || 0),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: String(p.category || 'General'),
    images: Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []),
    badge: p.badge, unit: p.unit,
    shortDescription: p.short_description, description: String(p.description || ''),
    sku: p.sku, slug: p.slug, brand: p.brand,
    isFeatured: Boolean(p.is_featured),
    variants: Array.isArray(p.variants) ? p.variants : [],
    attributes: Array.isArray(p.attributes) ? p.attributes : [],
    createdAt: p.created_at,
    salesCount: Number(p.sales_count || 0)
  });

  const mapProductToDB = (p: Partial<Product>) => {
    const db: any = {};
    if (p.name !== undefined) db.name = p.name;
    if (p.price !== undefined) db.price = Number(p.price);
    if (p.originalPrice !== undefined) db.original_price = p.originalPrice ? Number(p.originalPrice) : null;
    if (p.category !== undefined) db.category = p.category;
    if (p.images !== undefined) db.images = p.images;
    if (p.badge !== undefined) db.badge = p.badge;
    if (p.unit !== undefined) db.unit = p.unit;
    if (p.shortDescription !== undefined) db.short_description = p.shortDescription;
    if (p.description !== undefined) db.description = p.description;
    if (p.sku !== undefined) db.sku = p.sku;
    if (p.slug !== undefined) db.slug = p.slug;
    if (p.brand !== undefined) db.brand = p.brand;
    if (p.isFeatured !== undefined) db.is_featured = p.isFeatured;
    if (p.variants !== undefined) db.variants = p.variants;
    if (p.attributes !== undefined) db.attributes = p.attributes;
    return db;
  };

  const mapOrder = (o: any): Order => ({
    id: String(o.id),
    customerName: String(o.customer_name || 'Unknown'),
    customerEmail: o.customer_email || '',
    customerPhone: o.customer_phone || '',
    customerAddress: o.customer_address || '',
    customerDistrict: o.customer_district || '',
    customerArea: o.customer_area || '',
    date: String(o.date || new Date().toISOString()),
    total: Number(o.total || 0),
    subtotal: Number(o.subtotal || 0),
    shippingCost: Number(o.shipping_cost || 0),
    discount: Number(o.discount || 0),
    status: o.status || 'Pending',
    items: Array.isArray(o.items) ? o.items : [],
    coupon_code: o.coupon_code || undefined
  });

  const fetchData = async (activeUser?: any, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // 1. Fetch Public Data (Parallel) - Optimized for initial rendering
      // Use allSettled to prevent one failure from crashing everything
      const results = await Promise.allSettled([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('brands').select('*').order('name', { ascending: true }),
        supabase.from('settings').select('*').eq('key', 'shipping_fees').maybeSingle(),
        supabase.from('attributes').select('*').order('name', { ascending: true }),
        supabase.from('settings').select('*').eq('key', 'store_info').maybeSingle(),
        supabase.from('pages').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('key', 'home_sections').maybeSingle(),
        supabase.from('banners').select('*').order('sort_order', { ascending: true }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').eq('status', 'Active').order('created_at', { ascending: false })
      ]);

      const [pd, cat, br, set, attr, storeSettings, pagesRes, homeSectionsRes, bannerRes, blogRes, coupRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: null, error: r.reason });

      // Checks remain the same, as we default to { data: null } on failure
      if (pd.data) setProducts(pd.data.map(mapProduct));

      // Calculate Product Counts dynamically
      let calculatedCategories: Category[] = [];
      if (cat.data) {
        // 1. Get direct counts
        const directCounts = new Map<string, number>(); // Name -> Count
        if (pd.data) {
          pd.data.forEach((p: any) => {
            const catName = String(p.category || '').trim();
            if (catName) {
              directCounts.set(catName.toLowerCase(), (directCounts.get(catName.toLowerCase()) || 0) + 1);
            }
          });
        }

        // 2. Initial Map
        const initialCats = cat.data.map(c => ({
          id: String(c.id),
          name: c.name,
          image: c.image_url || '',
          slug: c.slug,
          parentId: c.parent_id ? String(c.parent_id) : null,
          itemCount: 0 // Will calculate below
        }));

        // 3. Aggregate Counts (including children)
        calculatedCategories = initialCats.map(c => {
          const allowedNames = new Set<string>();
          allowedNames.add(c.name.toLowerCase());

          // Recursive finder
          const findDescendants = (parentId: string) => {
            const children = initialCats.filter(child => child.parentId === parentId);
            children.forEach(child => {
              allowedNames.add(child.name.toLowerCase());
              findDescendants(child.id);
            });
          };
          findDescendants(c.id);

          // Sum counts
          let total = 0;
          allowedNames.forEach(name => {
            total += directCounts.get(name) || 0;
          });

          return { ...c, itemCount: total };
        });

        setCategories(calculatedCategories);
      }
      if (br.data) setBrands(br.data.map(b => ({ id: String(b.id), name: b.name, slug: b.slug, logo_url: b.logo_url })));
      if (set.data?.value) setShippingSettings(set.data.value);
      if (attr.data) setAttributes(attr.data.map(a => ({ id: String(a.id), name: a.name, values: Array.isArray(a.values) ? a.values : [] })));
      if (storeSettings.data?.value) setStoreInfo(storeSettings.data.value);
      if (pagesRes.data) setPages(pagesRes.data.map((p: any) => ({
        id: String(p.id),
        title: p.title,
        slug: p.slug,
        content: p.content,
        isPublished: p.is_published,
        createdAt: p.created_at
      })));
      if (homeSectionsRes.data?.value) setHomeSections(homeSectionsRes.data.value);
      if (bannerRes.data) setBanners(bannerRes.data.map(b => ({
        id: String(b.id),
        type: b.type,
        title: b.title,
        subtitle: b.subtitle,
        image_url: b.image_url,
        link: b.link,
        sort_order: b.sort_order,
        is_active: b.is_active
      })));
      if (blogRes.data) setBlogPosts(blogRes.data.map(p => ({
        id: String(p.id),
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        author: p.author,
        date: new Date(p.created_at).toLocaleDateString(),
        imageUrl: p.image_url,
        slug: p.slug,
        tags: p.tags || []
      })));
      // Initialize coupons with active ones for everyone (Admins will override with ALL coupons later)
      // Note: We use 'any' for the coupon map input to avoid strict type issues with Supabase return type
      if (coupRes.data) setCoupons(coupRes.data.map((c: any) => ({
        id: String(c.id),
        code: c.code,
        discountType: c.discount_type,
        discountValue: Number(c.discount_value),
        minimumSpend: Number(c.minimum_spend || 0),
        expiryDate: String(c.expiry_date),
        status: c.status,
        autoApply: Boolean(c.auto_apply),
        createdAt: String(c.created_at)
      })));

      let currentRole = null;
      let isSuperAdmin = false;

      // 2. Auth-Specific Data (Profile/Role) - Fetch BEFORE unblocking UI to prevent redirects
      if (activeUser) {
        // Fetch profile to check role
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', activeUser.id).maybeSingle();
        if (profile) {
          setUserProfile(profile);
          currentRole = profile.role;
        }
        isSuperAdmin = activeUser.email === SUPER_ADMIN_EMAIL;
      }

      // Public data & Profile loaded - Unblock UI
      setLoading(false);

      // 3. Admin Heavy Data (Lazy Loaded)
      if (activeUser) {
        if (currentRole === 'admin' || isSuperAdmin) {
          // Fetch heavy admin data ONLY for admins
          // Use allSettled here too just in case
          const adminResults = await Promise.allSettled([
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('coupons').select('*').order('created_at', { ascending: false }),
            supabase.from('reviews').select('*').order('created_at', { ascending: false })
          ]);

          const [ord, usersList, coup, fullRev] = adminResults.map(r => r.status === 'fulfilled' ? r.value : { data: null });

          if (ord.data) setOrders(ord.data.map(mapOrder));
          if (usersList.data) setUsers(usersList.data);
          if (coup.data) setCoupons(coup.data.map(c => ({ id: String(c.id), code: c.code, discountType: c.discount_type, discountValue: Number(c.discount_value), minimumSpend: Number(c.minimum_spend || 0), expiryDate: String(c.expiry_date), status: c.status, autoApply: Boolean(c.auto_apply), createdAt: String(c.created_at) })));
          if (fullRev.data) setReviews(fullRev.data.map(rv => ({ id: String(rv.id), productId: String(rv.product_id), productName: String(rv.product_name), authorName: String(rv.author_name), rating: Number(rv.rating), comment: String(rv.comment), reply: rv.reply, createdAt: String(rv.created_at) })));
        } else {
          // Regular customer: Fetch reviews for public display if not fetched already? 
          // In original code, reviews were fetched for everyone.
          // Moving reviews to admin-only might break Product Detail ratings if we rely on the global context 'reviews' array.
          // Let's re-add reviews fetch for public, but optimize it or keep it for now as it's needed for star ratings.
          // Actually, reviews are needed for public product cards (stars).
          // So we MUST fetch reviews for everyone, OR fetch them lazily/per product.
          // For now, to keep it simple and fast, let's fetch reviews in the public block again? 
          // Or better: Fetch only public reviews (approved?) or just all reviews if the table isn't huge.
          // Ideally, we move this to the public block.
          // Let's put reviews back in public block but maybe lighter query? 
          // Wait, the original code fetched reviews in the public block:
          // "supabase.from('reviews').select('id, product_id, rating').order('created_at', { ascending: false })"
          // That was lighter! (Line 253 in original view)
          // But line 315 fetched '*' for admins.

          // So: Public block gets lighter reviews. Admin block gets full reviews?
          // Existing logic had `rev` in public block (id, product_id, rating).
          // And `fullRev` in auth block.

          // I will restore that pattern.
          const { data: publicReviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
          if (publicReviews) setReviews(publicReviews.map(rv => ({ id: String(rv.id), productId: String(rv.product_id), productName: String(rv.product_name || ''), authorName: String(rv.author_name || 'Anonymous'), rating: Number(rv.rating), comment: String(rv.comment || ''), reply: rv.reply, createdAt: String(rv.created_at) })));
        }
      } else {
        // Guest user: also needs public reviews for stars
        const { data: publicReviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (publicReviews) setReviews(publicReviews.map(rv => ({ id: String(rv.id), productId: String(rv.product_id), productName: String(rv.product_name || ''), authorName: String(rv.author_name || 'Anonymous'), rating: Number(rv.rating), comment: String(rv.comment || ''), reply: rv.reply, createdAt: String(rv.created_at) })));
      }

      // Fetch Super Admin Name consistently for public display
      const { data: saProfile } = await supabase.from('profiles').select('full_name').eq('email', SUPER_ADMIN_EMAIL).maybeSingle();
      if (saProfile?.full_name) setSuperAdminName(saProfile.full_name);

    } catch (error: any) {
      console.error('Critical fetch error:', error.message);
    } finally {
      // Ensure loading is false even if error
      setLoading(false);
    }
  };

  const initializeAuth = async (sessionUser: any, showLoading = true) => {
    try {
      setUser(sessionUser);
      if (sessionUser) {
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).maybeSingle();

        if (!profile) {
          const { data: newProfile } = await supabase.from('profiles').upsert([{
            id: sessionUser.id,
            email: sessionUser.email,
            full_name: sessionUser.user_metadata?.full_name || '',
            role: sessionUser.email === SUPER_ADMIN_EMAIL ? 'admin' : 'customer'
          }], { onConflict: 'id' }).select().maybeSingle();
          profile = newProfile;
        }



        setUserProfile(profile || null);
        const [{ data: wishData }, { data: addrData }] = await Promise.all([
          supabase.from('wishlist').select('product_id').eq('user_id', sessionUser.id),
          supabase.from('addresses').select('*').eq('user_id', sessionUser.id)
        ]);
        if (wishData) setWishlist(wishData.map(w => String(w.product_id)));
        if (addrData) setAddresses(addrData.map(a => ({ id: String(a.id), fullName: a.full_name, phone: a.phone, addressLine: a.address_line, district: a.district, area: a.area })));

        await fetchData(sessionUser, showLoading);
      } else {
        await fetchData(null, showLoading);
      }
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const lastInitializedUser = useRef<string | null | 'PENDING'>('PENDING');

  useEffect(() => {
    // Only use onAuthStateChange to prevent race conditions involved with getSession()
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore TOKEN_REFRESHED to prevent loops
      if (event === 'TOKEN_REFRESHED') return;

      if (event === 'SIGNED_OUT') {
        lastInitializedUser.current = null;
        setUser(null);
        setUserProfile(null);
        setAddresses([]);
        setUsers([]);
        setWishlist([]);
        fetchData(null);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        const userId = session?.user?.id || null;
        if (userId !== lastInitializedUser.current) {
          initializeAuth(session?.user || null);
          lastInitializedUser.current = userId;
        }
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (appliedCoupon) {
      // Verification logic for existing coupon
      const currentCoupon = coupons.find(c => c.id === appliedCoupon.id);
      const subtotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);
      const today = new Date().toISOString().slice(0, 10);

      // 1. Coupon was deleted, deactivated, or criteria no longer met
      if (!currentCoupon || currentCoupon.status !== 'Active' || subtotal < currentCoupon.minimumSpend || currentCoupon.expiryDate < today) {
        setAppliedCoupon(null);
        return;
      }

      // 2. Auto-apply setting was turned off, and this was an auto-applied coupon
      if (appliedCoupon.isAutoApplied && !currentCoupon.autoApply) {
        setAppliedCoupon(null);
        return;
      }

      // 3. Sync data if coupon details changed (preserving isAutoApplied)
      if (JSON.stringify({ ...currentCoupon, isAutoApplied: appliedCoupon.isAutoApplied }) !== JSON.stringify(appliedCoupon)) {
        setAppliedCoupon({ ...currentCoupon, isAutoApplied: appliedCoupon.isAutoApplied });
      }
      return;
    }

    // Auto-apply logic (only runs if no coupon is applied)
    const subtotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);
    if (subtotal === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const eligibleCoupon = coupons.find(c =>
      c.autoApply &&
      c.status === 'Active' &&
      subtotal >= c.minimumSpend &&
      c.expiryDate >= today
    );

    if (eligibleCoupon) {
      setAppliedCoupon({ ...eligibleCoupon, isAutoApplied: true });
    }
  }, [cart, coupons, appliedCoupon]);

  const addToCart = (product: Product, variant?: Variant, quantity: number = 1) => {
    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
    setCart(prev => {
      const existing = prev.find(item => (item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id) === cartItemId);
      if (existing) {
        return prev.map(item => (item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id) === cartItemId
          ? { ...item, quantity: item.quantity + quantity }
          : item
        );
      }
      return [...prev, {
        ...product,
        quantity,
        selectedVariantId: variant?.id,
        selectedVariantName: variant?.attributeValues ? Object.values(variant.attributeValues).join(' / ') : undefined,
        selectedVariantImage: variant?.image,
        price: variant ? variant.price : product.price
      }];
    });
    setIsCartOpen(true);
  };

  const placeOrder = async (customerDetails: any): Promise<Order> => {
    const subtotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);
    const isDhaka = customerDetails.district?.toLowerCase() === 'dhaka';
    const shippingCostValue = isDhaka ? shippingSettings.insideDhaka : shippingSettings.outsideDhaka;

    let discountAmount = 0;
    if (appliedCoupon) {
      discountAmount = appliedCoupon.discountType === 'Fixed' ? appliedCoupon.discountValue : (subtotal * appliedCoupon.discountValue / 100);
    }
    const totalValue = subtotal + shippingCostValue - discountAmount;

    const orderData = {
      customer_name: customerDetails.fullName,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phone,
      customer_address: customerDetails.address,
      customer_district: customerDetails.district,
      customer_area: customerDetails.area,
      subtotal,
      shipping_cost: shippingCostValue,
      discount: discountAmount,
      total: totalValue,
      status: 'Pending',
      items: cart,
      coupon_code: appliedCoupon?.code,
      user_id: user?.id || null,
      date: new Date().toISOString()
    };

    const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
    if (error) throw new Error(error.message);

    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedCoupon');
    await fetchData(user);
    return mapOrder(data);
  };

  const updateHomeSectionsInDB = async (newSections: HomeSection[]) => {
    // Try UPDATE first (most common case to avoid RLS INSERT checks)
    const { error: updateError } = await supabase.from('settings').update({ value: newSections }).eq('key', 'home_sections');

    if (updateError) {
      if (updateError.code === 'PGRST116') { // Row not found (rare for settings but possible if fresh db)
        const { error: insertError } = await supabase.from('settings').insert([{ key: 'home_sections', value: newSections }]);
        if (insertError) throw new Error(insertError.message);
      } else {
        throw new Error(updateError.message);
      }
    }
    setHomeSections(newSections);
  };

  return (
    <StoreContext.Provider value={{
      products, categories, brands, orders, attributes, coupons, reviews, users, addresses, pages, blogPosts, banners, homeSections, wishlist, user, userProfile, shippingSettings, storeInfo, appliedCoupon, cart, isAdmin, adminTab, isCartOpen, loading, superAdminName,

      setAdminTab: (tab: AdminTab) => setAdminTab(tab), toggleAdmin: () => { }, addToCart, removeFromCart: (id) => setCart(cart.filter(i => (i.selectedVariantId ? `${i.id}-${i.selectedVariantId}` : i.id) !== id)),
      addHomeSection: async (section) => {
        const newSections = [...homeSections, { ...section, sortOrder: homeSections.length + 1 }];
        await updateHomeSectionsInDB(newSections);
      },
      updateHomeSection: async (id, section) => {
        const newSections = homeSections.map(s => s.id === id ? section : s);
        await updateHomeSectionsInDB(newSections);
      },
      deleteHomeSection: async (id) => {
        const newSections = homeSections.filter(s => s.id !== id);
        await updateHomeSectionsInDB(newSections);
      },
      updateQuantity: (id, d) => setCart(cart.map(i => {
        const itemKey = i.selectedVariantId ? `${i.id}-${i.selectedVariantId}` : i.id;
        if (itemKey === id) {
          return { ...i, quantity: Math.max(0, i.quantity + d) };
        }
        return i;
      }).filter(i => i.quantity > 0)),
      clearCart: () => setCart([]), openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false),
      placeOrder, updateOrder: async (id, data) => {
        const { error } = await supabase.from('orders').update({
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          customer_address: data.customerAddress,
          customer_district: data.customerDistrict,
          customer_area: data.customerArea,
          status: data.status,
          items: data.items,
          shipping_cost: data.shippingCost,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total
        }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateShippingSettings: async (s) => {
        const { error } = await supabase.from('settings').upsert({ key: 'shipping_fees', value: s });
        if (error) throw new Error(error.message);
        setShippingSettings(s);
      },
      updateStoreInfo: async (info) => {
        const { error } = await supabase.from('settings').upsert({ key: 'store_info', value: info });
        if (error) throw new Error(error.message);
        setStoreInfo(info);
      },
      addProduct: async (p) => {
        const baseSlug = p.slug || generateSlug(p.name || '');
        let uniqueSlug = ensureUniqueSlug(products, baseSlug);

        let attempt = 0;
        while (attempt < 3) {
          try {
            const productToSave = { ...p, slug: uniqueSlug };
            const { error } = await supabase.from('products').insert([mapProductToDB(productToSave)]);

            if (error) {
              // Check for unique violation (Postgres code 23505) on slug
              if (error.code === '23505' && (error.message.includes('slug') || error.details?.includes('slug'))) {
                // Fallback: Append random number to ensure uniqueness if state was stale
                uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
                attempt++;
                continue; // Retry with new slug
              }
              throw new Error(error.message);
            }

            // Success
            break;
          } catch (err: any) {
            if (attempt >= 2) throw err; // Give up after retries
            if (!err.message.includes('unique') && !err.message.includes('slug')) throw err; // Rethrow non-slug errors
            attempt++;
            uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
          }
        }

        await fetchData(user, false);
      },
      updateProduct: async (id, p) => {
        let attempt = 0;
        let currentSlug = p.slug;

        // If slug is being updated (or if we are just updating other fields but want to be safe)
        // If p.slug is undefined, we are not updating the slug, so no collision risk (unless name changes and we aren't handling that here, but Admin passes slug now)

        while (attempt < 3) {
          try {
            const dataToUpdate = mapProductToDB({ ...p, slug: currentSlug });
            const { error } = await supabase.from('products').update(dataToUpdate).eq('id', id);

            if (error) {
              if (error.code === '23505' && (error.message.includes('slug') || error.details?.includes('slug'))) {
                // Collision! Modify slug and retry
                // If no slug was provided initially but we hit collision (rare), or if provided slug collided
                const base = currentSlug || p.name?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'product';
                currentSlug = `${base}-${Math.floor(Math.random() * 10000)}`;
                attempt++;
                continue;
              }
              throw new Error(error.message);
            }
            break; // Success
          } catch (err: any) {
            if (attempt >= 2) throw err;
            if (!err.message.includes('unique') && !err.message.includes('slug')) throw err;

            attempt++;
            const base = currentSlug || p.name?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'product';
            currentSlug = `${base}-${Math.floor(Math.random() * 10000)}`;
          }
        }
        await fetchData(user, false);
      },
      deleteProduct: async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      addCategory: async (c) => {
        const baseSlug = c.slug || generateSlug(c.name);
        const uniqueSlug = ensureUniqueSlug(categories, baseSlug);
        const { error } = await supabase.from('categories').insert([{ name: c.name, slug: uniqueSlug, parent_id: c.parentId || null, image_url: c.image }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateCategory: async (id, c) => {
        const { error } = await supabase.from('categories').update({ name: c.name, slug: c.slug, parent_id: c.parentId || null, image_url: c.image }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteCategory: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      addBrand: async (b) => {
        const baseSlug = b.slug || generateSlug(b.name);
        const uniqueSlug = ensureUniqueSlug(brands, baseSlug);
        const { error } = await supabase.from('brands').insert([{ name: b.name, slug: uniqueSlug, logo_url: b.logo_url }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateBrand: async (id, b) => {
        const { error } = await supabase.from('brands').update({ name: b.name, slug: b.slug, logo_url: b.logo_url }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteBrand: async (id) => {
        const { error } = await supabase.from('brands').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateOrderStatus: async (id, status) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      addAttribute: async (n, v) => {
        const { error } = await supabase.from('attributes').insert([{ name: n, values: v }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateAttribute: async (id, n, v) => {
        const { error } = await supabase.from('attributes').update({ name: n, values: v }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteAttribute: async (id) => {
        const { error } = await supabase.from('attributes').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      addCoupon: async (c) => {
        const { error } = await supabase.from('coupons').insert([{
          code: c.code,
          discount_type: c.discountType,
          discount_value: c.discountValue,
          minimum_spend: c.minimumSpend,
          expiry_date: c.expiryDate,
          status: c.status,
          auto_apply: c.autoApply
        }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateCoupon: async (id, c) => {
        const { error } = await supabase.from('coupons').update({
          code: c.code,
          discount_type: c.discountType,
          discount_value: c.discountValue,
          minimum_spend: c.minimumSpend,
          expiry_date: c.expiryDate,
          status: c.status,
          auto_apply: c.autoApply
        }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteCoupon: async (id) => {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      applyCoupon: (code) => {
        const c = coupons.find(cp => cp.code === code && cp.status === 'Active');
        if (!c) return "Invalid Code";
        setAppliedCoupon({ ...c, isAutoApplied: false });
        return null;
      },
      removeCoupon: () => setAppliedCoupon(null),
      addReview: async (r) => {
        const { error } = await supabase.from('reviews').insert([{ product_id: r.productId, product_name: r.productName, author_name: r.authorName, rating: r.rating, comment: r.comment }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteReview: async (id) => {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      replyToReview: async (id, reply) => {
        const { error } = await supabase.from('reviews').update({ reply }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateUserRole: async (userId, role) => {
        const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateProfile: async (id, fullName) => {
        const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', id);
        if (error) throw new Error(error.message);
        setUserProfile(prev => prev ? { ...prev, full_name: fullName } : null);
        await fetchData(user, false);
      },
      changePassword: async (p) => {
        const { error } = await supabase.auth.updateUser({ password: p });
        if (error) throw new Error(error.message);
      },
      addAddress: async (d) => {
        const { error } = await supabase.from('addresses').insert([{ user_id: user.id, full_name: d.fullName, phone: d.phone, address_line: d.addressLine, district: d.district, area: d.area }]);
        if (error) throw new Error(error.message);
        await initializeAuth(user, false);
      },
      updateAddress: async (id, d) => {
        const { error } = await supabase.from('addresses').update({ full_name: d.fullName, phone: d.phone, address_line: d.addressLine, district: d.district, area: d.area }).eq('id', id);
        if (error) throw new Error(error.message);
        await initializeAuth(user, false);
      },
      deleteAddress: async (id) => {
        const { error } = await supabase.from('addresses').delete().eq('id', id);
        if (error) throw new Error(error.message);
        setAddresses(prev => prev.filter(a => a.id !== id));
      },
      addPage: async (p) => {
        const baseSlug = p.slug || generateSlug(p.title);
        const uniqueSlug = ensureUniqueSlug(pages, baseSlug);
        const { error } = await supabase.from('pages').insert([{
          title: p.title,
          slug: uniqueSlug,
          content: p.content,
          is_published: p.isPublished
        }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updatePage: async (id, p) => {
        const { error } = await supabase.from('pages').update({
          title: p.title,
          slug: p.slug,
          content: p.content,
          is_published: p.isPublished
        }).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deletePage: async (id) => {
        const { error } = await supabase.from('pages').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      addBanner: async (b) => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Attempting to add banner");
        console.log("User Email:", session?.user?.email);
        console.log("Profile Role:", userProfile?.role);

        // Use generic insert if specific RLS fails first time
        const { error } = await supabase.from('banners').insert([b]);
        if (error) {
          console.error("Supabase RLS Error:", error);
          throw error;
        }
        await fetchData(user, false);
      },
      updateBanner: async (id, b) => {
        const { error } = await supabase.from('banners').update(b).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      addBlogPost: async (p) => {
        const baseSlug = p.slug || generateSlug(p.title);
        const uniqueSlug = ensureUniqueSlug(blogPosts, baseSlug);
        const { error } = await supabase.from('blog_posts').insert([{
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          author: p.author,
          image_url: p.imageUrl,
          slug: uniqueSlug,
          tags: p.tags
        }]);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      updateBlogPost: async (id, p) => {
        const updates: any = {};
        if (p.title) updates.title = p.title;
        if (p.excerpt) updates.excerpt = p.excerpt;
        if (p.content) updates.content = p.content;
        if (p.author) updates.author = p.author;
        if (p.imageUrl) updates.image_url = p.imageUrl;
        if (p.slug) updates.slug = p.slug;
        if (p.tags) updates.tags = p.tags;

        const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteBlogPost: async (id) => {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      deleteBanner: async (id) => {
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) throw new Error(error.message);
        await fetchData(user, false);
      },
      toggleWishlist: async (pId) => {
        if (!user) return;
        if (wishlist.includes(pId)) {
          await supabase.from('wishlist').delete().match({ user_id: user.id, product_id: pId });
          setWishlist(prev => prev.filter(id => id !== pId));
        } else {
          await supabase.from('wishlist').insert([{ user_id: user.id, product_id: pId }]);
          setWishlist(prev => [...prev, pId]);
        }
      },
      signOut: async () => { await supabase.auth.signOut(); },
      refreshAllData: () => fetchData(user),
      searchQuery, setSearchQuery
    }
    } >
      {children}
    </StoreContext.Provider >
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
