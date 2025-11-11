import type { ProductDataItem, ProductVariant } from '../types/productData';

// Get the default variant (first variant)
export const getDefaultVariant = (product: ProductDataItem): ProductVariant => {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0];
  }
  // Fallback for legacy products
  return {
    name: 'Default',
    image: product.image || '',
    price: product.price || 0,
  };
};

// Get the default image
export const getDefaultImage = (product: ProductDataItem): string => {
  const variant = getDefaultVariant(product);
  return variant.image;
};

// Get the default price
export const getDefaultPrice = (product: ProductDataItem): number => {
  const variant = getDefaultVariant(product);
  return variant.price;
};

// Get variant by name
export const getVariantByName = (product: ProductDataItem, variantName: string): ProductVariant | null => {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }
  return product.variants.find(v => v.name === variantName) || null;
};

