import type { Product } from "@/types/product";
import type {
  ProductDataItem,
  ProductVariant,
  ShopProduct,
} from "@/types/productData";

function cover(p: Product) {
  const anyP = p as any;
  return (
    (anyP.coverImage as string | undefined) || (p.images && p.images[0]) || ""
  );
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





