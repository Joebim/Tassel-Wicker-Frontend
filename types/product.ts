export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
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
