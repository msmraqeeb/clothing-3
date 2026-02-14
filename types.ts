
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  badge?: string;
  unit?: string;
  shortDescription?: string;
  description: string; // Used as long description
  sku?: string;
  slug?: string;
  brand?: string;
  isFeatured?: boolean;
  variants?: Variant[];
  attributes?: { name: string; options: string[] }[];
  createdAt?: string;
  salesCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Variant {
  id: string;
  attributeValues: { [attributeName: string]: string };
  price: number; // Current selling price
  originalPrice?: number; // Strikethrough price
  sku: string;
  stock: number;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug?: string;
  parentId?: string | null;
  itemCount: number;
}

export interface AttributeValue {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Fixed' | 'Percentage';
  discountValue: number;
  minimumSpend: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
  autoApply: boolean;
  createdAt: string;
  isAutoApplied?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
  selectedVariantName?: string;
  selectedVariantImage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerDistrict?: string;
  customerArea?: string;
  date: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  coupon_code?: string;
}

export interface ShippingSettings {
  insideDhaka: number;
  outsideDhaka: number;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name?: string;
  created_at: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  district: string;
  area: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
}

export type ViewMode = 'home' | 'products' | 'admin';
export interface Banner {
  id: string;
  type: 'slider' | 'right_top' | 'right_bottom' | 'home_banner' | 'hero_grid';
  title?: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  buttonText?: string;
  sort_order?: number;
  is_active: boolean;
}

export type AdminTab = 'products' | 'orders' | 'shipping' | 'settings' | 'attributes' | 'categories' | 'brands' | 'coupons' | 'reviews' | 'users' | 'dashboard' | 'pages' | 'banners' | 'layout' | 'blog';

export interface StoreInfo {
  name: string;
  logo_url?: string;
  favicon_url?: string;
  address: string;
  phone: string;
  email: string;
  meta_title?: string;
  meta_description?: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  footer_description?: string;
  footer_links?: { label: string; url: string }[];
  app_links?: { ios?: string; android?: string };
  navigation?: { id: string; label: string; url: string; type: 'link' | 'dropdown'; children?: { label: string; url: string }[] }[];
  floatingWidget?: {
    whatsapp?: string;
    messenger?: string;
    facebook?: string;
    instagram?: string;
    phone?: string;
    supportImage?: string;
    isVisible?: boolean;
  };
}

export interface HomeSection {
  id: string;
  title: string;
  type: 'slider' | 'grid' | 'grid-no-banner' | 'tabbed-slider' | 'category-grid' | 'featured-category-sidebar' | 'three-column-banners' | 'single-banner' | 'brand-tabs' | 'featured-categories-grid' | 'featured-collection-scroll';
  filterType: 'category' | 'sale' | 'featured' | 'all';
  filterValue?: string;
  categoryIds?: string[]; // Added to store selected categories for customized grids
  brandNames?: string[]; // Added to store selected brands for brand-tabs
  sortOrder: number;
  isActive: boolean;
  banner?: {
    title: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    link: string;
  };
  gridBanners?: {
    title: string;
    subtitle?: string; // Top text for Featured Categories Grid
    imageUrl: string;
    link: string;
    categoryId?: string; // To fetch counts for Featured Categories Grid
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  author: string;
  date: string;
  imageUrl: string;
  slug: string;
  tags: string[];
}
