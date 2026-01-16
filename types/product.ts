export interface ProductImage {
  url: string;
  isCover?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[] | string[]; // Support both formats for backward compatibility
  coverImage?: string; // Deprecated: kept for backward compatibility, derived from image with isCover: true
  categoryId?: string;
  category: string;
  productType?: "basket" | "custom" | "single";
  productRole?: "main" | "sub";
  parentProductId?: string | null;
  linkedProductIds?: string[];
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  isNew?: boolean;
  isCustom?: boolean;
  variants?: Array<{ name: string; image: string; price: number }>;
  details?: Record<string, string | string[] | Record<string, string>>;
  createdAt: string;
  updatedAt: string;
  dimensions?: Record<string, string | number>;
  materials?: string[];
  careInstructions?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  featured?: boolean;
  search?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}
