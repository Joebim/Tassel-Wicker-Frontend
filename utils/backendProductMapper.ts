import type { Product, ProductImage } from "@/types/product";
import type {
  ProductDataItem,
  ProductVariant,
  ShopProduct,
} from "@/types/productData";

function cover(p: Product): string {
  const anyP = p as any;
  // Check for coverImage field (backward compatibility)
  if (anyP.coverImage) return anyP.coverImage;
  
  // Handle new image format with isCover
  if (Array.isArray(p.images) && p.images.length > 0) {
    // Check if first element is ProductImage object
    if (typeof p.images[0] === 'object' && p.images[0] !== null && 'url' in p.images[0]) {
      const coverImage = (p.images as ProductImage[]).find(img => img.isCover);
      if (coverImage) return coverImage.url;
      return (p.images[0] as ProductImage).url;
    }
    // Old format: string[]
    return (p.images[0] as string);
  }
  
  return "";
}

function variants(p: Product): ProductVariant[] {
  const anyP = p as any;
  const v = (anyP.variants as ProductVariant[] | undefined) || [];
  if (Array.isArray(v) && v.length > 0) return v;
  // fallback
  return [{ name: "Default", image: cover(p), price: p.price || 0 }];
}

export function toProductDataItem(p: Product): ProductDataItem {
  const anyP = p as any;
  const productType = anyP.productType as string | undefined;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    image: cover(p),
    price: p.price,
    variants: variants(p),
    details: (anyP.details as any) || undefined,
    isNew: !!anyP.isNew,
    isFeatured: !!p.featured,
    isCustom: !!anyP.isCustom || productType === "custom",
  } as unknown as ProductDataItem;
}

export function toShopProduct(p: Product): ShopProduct {
  const anyP = p as any;
  const productType = anyP.productType as string | undefined;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    image: cover(p),
    price: p.price,
    isNew: !!anyP.isNew,
    isFeatured: !!p.featured,
    isCustom: !!anyP.isCustom || productType === "custom",
    variants: (anyP.variants as ProductVariant[] | undefined) || undefined,
    details: (anyP.details as any) || undefined,
  };
}









