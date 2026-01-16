'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LuImagePlus, LuTrash2, LuX, LuSearch, LuPlus, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';
import type { UploadFile } from '@/types/upload';
import type { Product, ProductCategory, ProductImage } from '@/types/product';

type ProductType = 'basket' | 'custom' | 'single';
type ProductRole = 'main' | 'sub';

type LinkedProductLite = { id: string; name: string; productType?: ProductType; productRole?: ProductRole };

type ProductEditorMode = 'create' | 'edit';

type ProductInput = {
  externalId?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  coverImage?: string; // Keep for backward compatibility, but use images[].isCover instead
  categoryId?: string;
  category?: string;
  productType: ProductType;
  productRole: ProductRole;
  parentProductId?: string;
  linkedProductIds: string[];
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  isNew: boolean;
  isCustom: boolean;
  variants: { name: string; image: string; price: number }[];
  dimensions: { key: string; value: string }[];
  materials: string[];
  careInstructions: string;
  details: {
    key: string;
    type: 'string' | 'array' | 'object';
    valueString: string;
    valueArray: string[];
    valueObject: { key: string; value: string }[];
  }[];
};

const defaultInput: ProductInput = {
  name: '',
  description: '',
  price: 0,
  images: [],
  productType: 'single',
  productRole: 'main',
  linkedProductIds: [],
  tags: [],
  inStock: true,
  stockQuantity: 0,
  featured: false,
  isNew: false,
  isCustom: false,
  variants: [],
  dimensions: [],
  materials: [],
  careInstructions: '',
  details: [],
};

// Helper function to normalize images (handle both string[] and ProductImage[])

const normalizeImages = (images: string[] | ProductImage[]): ProductImage[] => {
  if (!Array.isArray(images)) return [];
  if (images.length === 0) return [];
  // Check if first element is a string (old format)
  if (typeof images[0] === 'string') {
    return (images as string[]).map((url, index) => ({ url, isCover: index === 0 }));
  }
  return images as ProductImage[];
};

// Helper function to get cover image URL
const getCoverImageUrl = (images: ProductImage[]): string | undefined => {
  const coverImage = images.find(img => img.isCover);
  return coverImage?.url || images[0]?.url;
};

export function ProductForm({
  mode,
  productId,
}: {
  mode: ProductEditorMode;
  productId?: string;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [input, setInput] = useState<ProductInput>(defaultInput);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  // Local state for inputs that need parsing (fixes comma separation issues)
  const [tagsInput, setTagsInput] = useState('');
  const [materialsInput, setMaterialsInput] = useState('');

  // Visibility state for optional sections
  const [visibleSections, setVisibleSections] = useState({
    variants: false,
    dimensions: false,
    materials: false,
    careInstructions: false,
  });

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Linked products display names (so we can render chips)
  const [linkedProducts, setLinkedProducts] = useState<LinkedProductLite[]>([]);

  // Search (for linking / parent)
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<LinkedProductLite[]>([]);
  const [searching, setSearching] = useState(false);

  const [parentSearch, setParentSearch] = useState('');
  const [parentResults, setParentResults] = useState<LinkedProductLite[]>([]);
  const [parentSearching, setParentSearching] = useState(false);
  const [parentPicked, setParentPicked] = useState<LinkedProductLite | null>(null);

  // Carousel state for images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const [uploading, setUploading] = useState(false); // No longer needed as modal handles uploading

  // Media Library Modal State
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalMultiple, setMediaModalMultiple] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'media' | 'product-image'>('product-image');
  const [onMediaSelect, setOnMediaSelect] = useState<(files: UploadFile[]) => void>(() => { });

  const openMediaLibrary = (
    multiple: boolean,
    type: 'media' | 'product-image',
    callback: (files: UploadFile[]) => void
  ) => {
    setMediaModalMultiple(multiple);
    setMediaModalType(type);
    setOnMediaSelect(() => callback);
    setMediaModalOpen(true);
  };

  // Reset carousel index when images change
  useEffect(() => {
    if (input.images.length > 0 && currentImageIndex >= input.images.length) {
      setCurrentImageIndex(0);
    }
  }, [input.images.length, currentImageIndex]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const cats = await apiFetch<{ items: ProductCategory[] }>('/api/categories', { method: 'GET' });
        if (!alive) return;
        setCategories(cats.items || []);
      } catch (e) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Failed to load categories',
          message: e instanceof Error ? e.message : 'Could not load categories.',
        });
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !productId) return;

    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<{ item: Product; linkedProducts?: Product[] }>(
          `/api/products/${productId}?include=linked`,
          { method: 'GET' }
        );

        if (!alive) return;

        const p = data.item;
        // Normalize images to ProductImage[] format
        const normalizedImages = normalizeImages(Array.isArray(p.images) ? p.images : []);
        // Ensure only one cover image
        const imagesWithCover = normalizedImages.map((img, index) => ({
          ...img,
          isCover: p.coverImage ? img.url === p.coverImage : (index === 0 && !normalizedImages.some(i => i.isCover)),
        }));
        setInput({
          externalId: 'externalId' in p ? (p as Product & { externalId?: string }).externalId : undefined,
          name: p.name || '',
          description: p.description || '',
          price: Number(p.price || 0),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
          images: imagesWithCover,
          coverImage: getCoverImageUrl(imagesWithCover),
          categoryId: p.categoryId,
          category: p.category,
          productType: (p.productType || 'single') as ProductType,
          productRole: (p.productRole || 'main') as ProductRole,
          parentProductId: p.parentProductId || undefined,
          linkedProductIds: Array.isArray(p.linkedProductIds) ? p.linkedProductIds : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          inStock: !!p.inStock,
          stockQuantity: Number(p.stockQuantity || 0),
          featured: !!p.featured,
          isNew: !!p.isNew,
          isCustom: !!p.isCustom,
          variants: Array.isArray(p.variants) ? p.variants : [],
          dimensions: p.dimensions ? Object.entries(p.dimensions).map(([key, value]) => ({ key, value: String(value) })) : [],
          materials: Array.isArray(p.materials) ? p.materials : [],
          careInstructions: p.careInstructions || '',
          details: p.details ? Object.entries(p.details).map(([k, v]) => {
            if (typeof v === 'string') {
              return { key: k, type: 'string', valueString: v, valueArray: [], valueObject: [] };
            } else if (Array.isArray(v)) {
              return { key: k, type: 'array', valueString: '', valueArray: v, valueObject: [] };
            } else if (typeof v === 'object' && v !== null) {
              return {
                key: k,
                type: 'object',
                valueString: '',
                valueArray: [],
                valueObject: Object.entries(v).map(([subK, subV]) => ({ key: subK, value: String(subV) }))
              };
            }
            return { key: k, type: 'string', valueString: '', valueArray: [], valueObject: [] }; // Fallback
          }) as any : [],
        });

        // Initialize local string inputs
        setTagsInput(Array.isArray(p.tags) ? p.tags.join(', ') : '');
        setMaterialsInput(Array.isArray(p.materials) ? p.materials.join(', ') : '');

        // Initialize visibility
        setVisibleSections({
          variants: (p.variants && p.variants.length > 0) || false,
          dimensions: (p.dimensions && Object.keys(p.dimensions).length > 0) || false,
          materials: (p.materials && p.materials.length > 0) || false,
          careInstructions: !!p.careInstructions,
        });

        const linked = (data.linkedProducts || []).map((lp) => ({
          id: lp.id,
          name: lp.name,
          productType: lp.productType as ProductType | undefined,
          productRole: lp.productRole as ProductRole | undefined,
        }));
        setLinkedProducts(linked);
      } catch (e) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Failed to load product',
          message: e instanceof Error ? e.message : 'Could not load product details.',
        });
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [mode, productId]);

  // Auto-correction: if categoryId is missing/invalid but category name matches a loaded category, pick that ID.
  useEffect(() => {
    if (categories.length === 0) return;

    const validId = input.categoryId && categories.some(c => c.id === input.categoryId);
    if (!validId && input.category) {
      const match = categories.find(c => c.name === input.category);
      if (match) {
        setInput(prev => ({ ...prev, categoryId: match.id }));
      }
    }
  }, [categories, input.categoryId, input.category]);

  // Auto-sync default variant for new single products
  useEffect(() => {
    if (mode !== 'create' || input.productType !== 'single') return;

    // Determine the current cover image or first image
    const coverUrl = input.images.find(img => img.isCover)?.url || input.images[0]?.url || '';

    setInput(prev => {
      // If no variants, add one
      if (prev.variants.length === 0) {
        return {
          ...prev,
          variants: [{ name: 'Default', price: Number(prev.price), image: coverUrl }]
        };
      }
      // If there is exactly one variant and it's named "Default", update it
      if (prev.variants.length === 1 && prev.variants[0].name === 'Default') {
        // Only update if changed to avoid loop (though React state setter optimization handles simple equality)
        const currentVar = prev.variants[0];
        if (currentVar.price !== Number(prev.price) || currentVar.image !== coverUrl) {
          return {
            ...prev,
            variants: [{ ...currentVar, price: Number(prev.price), image: coverUrl }]
          };
        }
      }
      return prev;
    });
  }, [mode, input.productType, input.price, input.images]);

  // Linking search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(() => {
      let alive = true;
      const run = async () => {
        try {
          setSearching(true);
          const data = await apiFetch<{ items: Product[] }>(
            `/api/products?limit=20&page=1&search=${encodeURIComponent(search.trim())}`,
            { method: 'GET' }
          );
          if (!alive) return;
          setSearchResults(
            (data.items || []).map((p) => ({
              id: p.id,
              name: p.name,
              productType: p.productType as ProductType | undefined,
              productRole: p.productRole as ProductRole | undefined,
            }))
          );
        } catch {
          // ignore search errors
        } finally {
          if (alive) setSearching(false);
        }
      };
      run();
      return () => {
        alive = false;
      };
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  // Parent product search (main products only)
  useEffect(() => {
    if (!parentSearch.trim()) {
      setParentResults([]);
      return;
    }

    const t = setTimeout(() => {
      let alive = true;
      const run = async () => {
        try {
          setParentSearching(true);
          const data = await apiFetch<{ items: Product[] }>(
            `/api/products?limit=20&page=1&role=main&search=${encodeURIComponent(parentSearch.trim())}`,
            { method: 'GET' }
          );
          if (!alive) return;
          setParentResults(
            (data.items || []).map((p) => ({
              id: p.id,
              name: p.name,
              productType: p.productType as ProductType | undefined,
              productRole: p.productRole as ProductRole | undefined,
            }))
          );
        } catch {
          // ignore
        } finally {
          if (alive) setParentSearching(false);
        }
      };
      run();
      return () => {
        alive = false;
      };
    }, 300);

    return () => clearTimeout(t);
  }, [parentSearch]);

  const categoryName = useMemo(() => {
    const found = categories.find((c) => c.id === input.categoryId);
    return found?.name || input.category || '';
  }, [categories, input.categoryId, input.category]);

  const canDelete = isAdmin && mode === 'edit' && !!productId;

  const addLinked = (p: LinkedProductLite) => {
    if (input.linkedProductIds.includes(p.id)) return;
    setInput((prev) => ({ ...prev, linkedProductIds: [...prev.linkedProductIds, p.id] }));
    setLinkedProducts((prev) => {
      if (prev.some((x) => x.id === p.id)) return prev;
      return [...prev, p];
    });
  };

  const removeLinked = (id: string) => {
    setInput((prev) => ({ ...prev, linkedProductIds: prev.linkedProductIds.filter((x) => x !== id) }));
    setLinkedProducts((prev) => prev.filter((x) => x.id !== id));
  };

  /*
   * Replaced by MediaLibraryModal logic below
   *
  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await apiFetch<{ success: boolean; url: string }>(
        '/api/uploads/product-image',
        { method: 'POST', body: form }
      );

      setInput((prev) => {
        const isFirstImage = prev.images.length === 0;
        const newImage: ProductImage = { url: res.url, isCover: isFirstImage };
        const nextImages = [...prev.images, newImage];
        return {
          ...prev,
          images: nextImages,
          coverImage: isFirstImage ? res.url : getCoverImageUrl(nextImages)
        };
      });

      // Set carousel to show the newly uploaded image
      setCurrentImageIndex(input.images.length);

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Image uploaded',
        message: 'Image added to product.',
      });
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Upload failed',
        message: e instanceof Error ? e.message : 'Failed to upload image.',
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadVariantImage = async (file: File, variantIndex: number) => {
    try {
      // We can reuse the upload spinner or add a local one, for now just reuse uploading state if simple
      // or just do it silently/with toast
      const form = new FormData();
      form.append('file', file);
      const res = await apiFetch<{ success: boolean; url: string }>(
        '/api/uploads/product-image',
        { method: 'POST', body: form }
      );

      setInput(prev => {
        const newVariants = [...prev.variants];
        if (newVariants[variantIndex]) {
          newVariants[variantIndex] = { ...newVariants[variantIndex], image: res.url };
        }
        return { ...prev, variants: newVariants };
      });

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Variant image uploaded',
        message: 'Image set for variant.',
      });
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Upload failed',
        message: e instanceof Error ? e.message : 'Failed to upload variant image.',
      });
    }
  };
  */

  const removeImage = (index: number) => {
    setInput((prev) => {
      const imageToRemove = prev.images[index];
      const wasCover = imageToRemove?.isCover;
      const nextImages = prev.images.filter((_, i) => i !== index);

      // If we removed the cover image, set the first remaining image as cover
      if (wasCover && nextImages.length > 0) {
        nextImages[0].isCover = true;
      }

      return {
        ...prev,
        images: nextImages,
        coverImage: getCoverImageUrl(nextImages)
      };
    });

    // Adjust carousel index if needed
    if (currentImageIndex >= input.images.length - 1 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const setCoverImage = (index: number) => {
    setInput((prev) => {
      const nextImages = prev.images.map((img, i) => ({
        ...img,
        isCover: i === index,
      }));
      return {
        ...prev,
        images: nextImages,
        coverImage: getCoverImageUrl(nextImages)
      };
    });
  };

  const submit = async () => {
    try {
      setSaving(true);
      const payload = {
        externalId: input.externalId || undefined,
        name: input.name,
        description: input.description,
        price: Number(input.price),
        originalPrice: input.originalPrice ? Number(input.originalPrice) : undefined,
        images: input.images.map(img => ({
          url: img.url,
          isCover: img.isCover || false,
        })),
        coverImage: input.coverImage || undefined, // Keep for backward compatibility
        categoryId: input.categoryId || undefined,
        category: categoryName || undefined,
        productType: input.productType,
        productRole: input.productRole,
        parentProductId: input.productRole === 'sub' ? (input.parentProductId || undefined) : undefined,
        linkedProductIds: input.linkedProductIds,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        inStock: input.inStock,
        stockQuantity: Number(input.stockQuantity),
        featured: input.featured,
        isNew: input.isNew,
        isCustom: input.isCustom,
        variants: (mode === 'create' && input.productType === 'single' && input.variants.length === 0)
          ? [{
            name: 'Default',
            price: Number(input.price),
            image: input.images.find(img => img.isCover)?.url || input.images[0]?.url || ''
          }]
          : input.variants,
        dimensions: input.dimensions.filter(d => d.key.trim()).reduce((acc, curr) => ({ ...acc, [curr.key.trim()]: curr.value.trim() }), {}),
        materials: materialsInput.split(',').map(m => m.trim()).filter(Boolean),
        careInstructions: input.careInstructions,
        details: input.details.filter(d => d.key.trim()).reduce((acc, curr) => {
          if (curr.type === 'string') {
            return { ...acc, [curr.key.trim()]: curr.valueString };
          } else if (curr.type === 'array') {
            return { ...acc, [curr.key.trim()]: curr.valueArray.filter(x => x.trim()) };
          } else if (curr.type === 'object') {
            const obj = curr.valueObject.filter(x => x.key.trim()).reduce((subAcc, sub) => ({ ...subAcc, [sub.key.trim()]: sub.value }), {});
            return { ...acc, [curr.key.trim()]: obj };
          }
          return acc;
        }, {}),
      };

      if (mode === 'create') {
        const created = await apiFetch<{ item: Product }>(
          '/api/products',
          { method: 'POST', body: JSON.stringify(payload) }
        );
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Product created',
          message: created.item?.name || 'Product created successfully.',
        });
        router.replace(`/admin/products/${created.item.id}`);
        return;
      }

      if (!productId) throw new Error('Missing productId');
      const updated = await apiFetch<{ item: Product }>(
        `/api/products/${productId}`,
        { method: 'PUT', body: JSON.stringify(payload) }
      );
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Product saved',
        message: updated.item?.name || 'Changes saved successfully.',
      });
    } catch (e) {
      // Auto-show sections if they have errors
      const errData = (e as any).data;
      if (errData && errData.details && errData.details.fieldErrors) {
        const errors = errData.details.fieldErrors;
        setVisibleSections(prev => ({
          ...prev,
          variants: prev.variants || !!errors.variants,
          dimensions: prev.dimensions || !!errors.dimensions,
          materials: prev.materials || !!errors.materials,
          careInstructions: prev.careInstructions || !!errors.careInstructions,
        }));
      }

      useToastStore.getState().addToast({
        type: 'error',
        title: 'Save failed',
        message: e instanceof Error ? e.message : 'Failed to save product.',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!canDelete || !productId) return;
    const ok = await useConfirmStore.getState().confirm({
      title: 'Delete Product',
      message: 'Delete this product? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });
    if (!ok) return;

    try {
      await apiFetch<{ success: boolean }>(`/api/products/${productId}`, { method: 'DELETE' });
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Product deleted',
        message: 'The product was deleted successfully.',
      });
      router.replace('/admin/products');
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Delete failed',
        message: e instanceof Error ? e.message : 'Failed to delete product.',
      });
    }
  };

  if (loading) {
    return (
      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-8">
        <div className="text-luxury-cool-grey font-extralight">Loading product…</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Core details */}
          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              Product details
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Name
                </label>
                <input
                  value={input.name}
                  onChange={(e) => setInput({ ...input, name: e.target.value })}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={input.price}
                  onChange={(e) => setInput({ ...input, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                />
              </div>

              <div>
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Original price (optional)
                </label>
                <input
                  type="number"
                  value={input.originalPrice ?? ''}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      originalPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Description
                </label>
                <textarea
                  value={input.description}
                  onChange={(e) => setInput({ ...input, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                  placeholder="Write a detailed description…"
                />
              </div>

              <div>
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Category
                </label>
                <select
                  value={input.categoryId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cat = categories.find(c => c.id === val);
                    setInput({ ...input, categoryId: val || undefined, category: cat?.name });
                  }}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {!!categoryName && (
                  <div className="mt-2 text-xs text-luxury-cool-grey font-extralight">
                    Stored label: <span className="text-luxury-black">{categoryName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Product type
                </label>
                <select
                  value={input.productType}
                  onChange={(e) => setInput({ ...input, productType: e.target.value as ProductType })}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                >
                  <option value="basket">Basket</option>
                  <option value="custom">Custom</option>
                  <option value="single">Single</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Product role
                </label>
                <select
                  value={input.productRole}
                  onChange={(e) => setInput({ ...input, productRole: e.target.value as ProductRole })}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                >
                  <option value="main">Main</option>
                  <option value="sub">Sub</option>
                </select>
              </div>

              {input.productRole === 'sub' && (
                <div className="md:col-span-2 border border-luxury-warm-grey/20 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                    Parent product (optional)
                  </div>
                  {parentPicked ? (
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="text-sm font-extralight text-luxury-black">
                        {parentPicked.name}
                        <span className="ml-2 text-xs text-luxury-cool-grey uppercase">
                          {parentPicked.productType || 'single'} / {parentPicked.productRole || 'main'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setParentPicked(null);
                          setInput({ ...input, parentProductId: undefined });
                        }}
                        className="p-2 hover:bg-luxury-warm-grey/10 rounded transition-colors"
                        aria-label="Remove parent"
                      >
                        <LuX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="relative flex-1">
                          <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cool-grey" />
                          <input
                            value={parentSearch}
                            onChange={(e) => setParentSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                            placeholder="Search main products to set as parent…"
                          />
                        </div>
                        {parentSearching && (
                          <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                            Searching…
                          </div>
                        )}
                      </div>
                      {parentResults.length > 0 && (
                        <div className="mt-3 max-h-56 overflow-auto border border-luxury-warm-grey/20 rounded-lg">
                          {parentResults.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setParentPicked(p);
                                setInput({ ...input, parentProductId: p.id });
                                setParentSearch('');
                                setParentResults([]);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-luxury-warm-grey/10 transition-colors"
                            >
                              <div className="text-sm font-extralight text-luxury-black">{p.name}</div>
                              <div className="text-xs font-extralight text-luxury-cool-grey uppercase tracking-[0.2em]">
                                {p.productType || 'single'} / {p.productRole || 'main'}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Tags (comma separated)
                </label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                  placeholder="luxury, gift, limited…"
                />
              </div>

              {/* Dynamic Dimensions */}
              {visibleSections.dimensions && (
                <div className="md:col-span-2 border border-luxury-warm-grey/20 rounded-lg p-4 bg-luxury-warm-grey/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                      Dimensions
                    </div>
                    <button
                      type="button"
                      onClick={() => setInput({ ...input, dimensions: [...input.dimensions, { key: '', value: '' }] })}
                      className="flex items-center gap-1 text-brand-purple text-xs uppercase font-extralight hover:underline"
                    >
                      <LuPlus size={12} /> Add Dimension
                    </button>
                  </div>
                  {input.dimensions.length === 0 && (
                    <div className="text-sm font-extralight text-luxury-cool-grey italic">No dimensions added.</div>
                  )}
                  <div className="space-y-2">
                    {input.dimensions.map((dim, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={dim.key}
                          onChange={(e) => {
                            const next = [...input.dimensions];
                            next[idx].key = e.target.value;
                            setInput({ ...input, dimensions: next });
                          }}
                          className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-1 focus:ring-brand-purple font-extralight text-sm"
                          placeholder="Length, Width..."
                        />
                        <input
                          value={dim.value}
                          onChange={(e) => {
                            const next = [...input.dimensions];
                            next[idx].value = e.target.value;
                            setInput({ ...input, dimensions: next });
                          }}
                          className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-1 focus:ring-brand-purple font-extralight text-sm"
                          placeholder="30cm, 5kg..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = input.dimensions.filter((_, i) => i !== idx);
                            setInput({ ...input, dimensions: next });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          title="Remove dimension"
                        >
                          <LuTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {visibleSections.materials && (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-extralight text-luxury-black uppercase">
                      Materials
                    </label>
                  </div>
                  <input
                    value={materialsInput}
                    onChange={(e) => setMaterialsInput(e.target.value)}
                    className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                    placeholder="Wicker, Cotton, Leather (comma separated)…"
                  />
                </div>
              )}

              {/* Care Instructions */}
              {visibleSections.careInstructions && (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-extralight text-luxury-black uppercase">
                      Care Instructions
                    </label>
                  </div>
                  <textarea
                    value={input.careInstructions}
                    onChange={(e) => setInput({ ...input, careInstructions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                    placeholder="Wipe clean with a damp cloth…"
                  />
                </div>
              )}

              {/* Dynamic Details (e.g. Ingredients) */}
              <div className="md:col-span-2 mt-4 space-y-4">
                <div className="flex items-center justify-between border-b border-luxury-warm-grey/20 pb-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                    Additional Details
                  </div>
                  <button
                    type="button"
                    onClick={() => setInput({
                      ...input,
                      details: [...input.details, { key: '', type: 'string', valueString: '', valueArray: [], valueObject: [] }]
                    })}
                    className="flex items-center gap-1 text-brand-purple text-xs uppercase font-extralight hover:underline"
                  >
                    <LuPlus size={12} /> Add Detail Item
                  </button>
                </div>

                {input.details.length === 0 && (
                  <div className="text-sm font-extralight text-luxury-cool-grey italic">
                    No additional details (like Ingredients, Specifications, etc.).
                  </div>
                )}

                {input.details.map((detail, idx) => (
                  <div key={idx} className="border border-luxury-warm-grey/20 rounded-lg p-4 bg-luxury-warm-grey/5">
                    <div className="flex flex-col md:flex-row gap-2 mb-3 items-start md:items-center">
                      <input
                        value={detail.key}
                        onChange={(e) => {
                          const next = [...input.details];
                          next[idx].key = e.target.value;
                          setInput({ ...input, details: next });
                        }}
                        className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple w-full md:w-auto"
                        placeholder="Name (e.g. Volume, Contents)"
                      />
                      <select
                        value={detail.type}
                        onChange={(e) => {
                          const next = [...input.details];
                          next[idx].type = e.target.value as any;
                          setInput({ ...input, details: next });
                        }}
                        className="px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black text-xs font-extralight focus:outline-none focus:ring-1 focus:ring-brand-purple w-full md:w-auto"
                      >
                        <option value="string">Single Text (e.g. Volume)</option>
                        <option value="array">List of Items (e.g. Contents)</option>
                        <option value="object">Structured Data (e.g. Notes)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const next = input.details.filter((_, i) => i !== idx);
                          setInput({ ...input, details: next });
                        }}
                        className="text-red-500 p-2 hover:bg-red-50 rounded self-end md:self-center"
                        title="Remove Detail"
                      >
                        <LuTrash2 size={14} />
                      </button>
                    </div>

                    <div className="pl-0 md:pl-4 border-l-0 md:border-l-2 border-luxury-cool-grey/20">
                      {/* String Type UI */}
                      {detail.type === 'string' && (
                        <input
                          value={detail.valueString}
                          onChange={(e) => {
                            const next = [...input.details];
                            next[idx].valueString = e.target.value;
                            setInput({ ...input, details: next });
                          }}
                          className="w-full px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black text-sm font-extralight focus:outline-none focus:ring-1 focus:ring-brand-purple"
                          placeholder="Value (e.g. 750ml)..."
                        />
                      )}

                      {/* Array Type UI */}
                      {detail.type === 'array' && (
                        <div className="space-y-2">
                          {detail.valueArray.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <input
                                value={item}
                                onChange={(e) => {
                                  const next = [...input.details];
                                  next[idx].valueArray[itemIdx] = e.target.value;
                                  setInput({ ...input, details: next });
                                }}
                                className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black text-sm font-extralight focus:outline-none focus:ring-1 focus:ring-brand-purple"
                                placeholder="Item..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...input.details];
                                  next[idx].valueArray = next[idx].valueArray.filter((_, i) => i !== itemIdx);
                                  setInput({ ...input, details: next });
                                }}
                                className="text-luxury-cool-grey hover:text-red-500 transition-colors"
                              >
                                <LuX size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...input.details];
                              next[idx].valueArray.push('');
                              setInput({ ...input, details: next });
                            }}
                            className="text-xs text-brand-purple uppercase tracking-wider font-extralight hover:underline mt-2 flex items-center gap-1"
                          >
                            <LuPlus size={12} /> Add Item
                          </button>
                        </div>
                      )}

                      {/* Object Type UI */}
                      {detail.type === 'object' && (
                        <div className="space-y-2">
                          {detail.valueObject.map((objItem, objIdx) => (
                            <div key={objIdx} className="flex items-center gap-2">
                              <input
                                value={objItem.key}
                                onChange={(e) => {
                                  const next = [...input.details];
                                  next[idx].valueObject[objIdx].key = e.target.value;
                                  setInput({ ...input, details: next });
                                }}
                                className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple"
                                placeholder="Key (e.g. Top)..."
                              />
                              <input
                                value={objItem.value}
                                onChange={(e) => {
                                  const next = [...input.details];
                                  next[idx].valueObject[objIdx].value = e.target.value;
                                  setInput({ ...input, details: next });
                                }}
                                className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black text-sm font-extralight focus:outline-none focus:ring-1 focus:ring-brand-purple"
                                placeholder="Value..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...input.details];
                                  next[idx].valueObject = next[idx].valueObject.filter((_, i) => i !== objIdx);
                                  setInput({ ...input, details: next });
                                }}
                                className="text-luxury-cool-grey hover:text-red-500 transition-colors"
                              >
                                <LuX size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...input.details];
                              next[idx].valueObject.push({ key: '', value: '' });
                              setInput({ ...input, details: next });
                            }}
                            className="text-xs text-brand-purple uppercase tracking-wider font-extralight hover:underline mt-2 flex items-center gap-1"
                          >
                            <LuPlus size={12} /> Add Key-Value Pair
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory + flags */}
          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              Inventory & flags
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 text-sm font-extralight text-luxury-black">
                <input
                  type="checkbox"
                  checked={input.inStock}
                  onChange={(e) => setInput({ ...input, inStock: e.target.checked })}
                  className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-luxury-cool-grey"
                />
                In stock
              </label>

              <div>
                <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                  Stock quantity
                </label>
                <input
                  type="number"
                  value={input.stockQuantity}
                  onChange={(e) => setInput({ ...input, stockQuantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-extralight text-luxury-black">
                <input
                  type="checkbox"
                  checked={input.featured}
                  onChange={(e) => setInput({ ...input, featured: e.target.checked })}
                  className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-luxury-cool-grey"
                />
                Featured
              </label>

              <label className="flex items-center gap-3 text-sm font-extralight text-luxury-black">
                <input
                  type="checkbox"
                  checked={input.isNew}
                  onChange={(e) => setInput({ ...input, isNew: e.target.checked })}
                  className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-luxury-cool-grey"
                />
                New
              </label>

              <label className="flex items-center gap-3 text-sm font-extralight text-luxury-black">
                <input
                  type="checkbox"
                  checked={input.isCustom}
                  onChange={(e) => setInput({ ...input, isCustom: e.target.checked })}
                  className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-luxury-cool-grey"
                />
                Custom
              </label>
            </div>
          </div>

          {/* Linked products */}
          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                Linked products
              </div>
              <div className="text-xs font-extralight text-luxury-cool-grey">
                Use this for basket contents or “main + sub items”.
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {linkedProducts.length === 0 && (
                <div className="text-sm font-extralight text-luxury-cool-grey">No linked products.</div>
              )}
              {linkedProducts.map((p) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-luxury-warm-grey/20 rounded-full"
                >
                  <span className="text-sm font-extralight text-luxury-black">{p.name}</span>
                  <span className="text-xs font-extralight text-luxury-cool-grey uppercase tracking-[0.2em]">
                    {p.productType || 'single'}/{p.productRole || 'main'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLinked(p.id)}
                    className="p-1 hover:bg-luxury-warm-grey/10 rounded-full transition-colors"
                    aria-label="Remove linked"
                  >
                    <LuX size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="relative">
                <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cool-grey" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                  placeholder="Search products to link…"
                />
              </div>

              {(searching || searchResults.length > 0) && (
                <div className="mt-3 border border-luxury-warm-grey/20 rounded-lg overflow-hidden">
                  {searching && (
                    <div className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                      Searching…
                    </div>
                  )}
                  {searchResults.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-luxury-warm-grey/10">
                      <div>
                        <div className="text-sm font-extralight text-luxury-black">{p.name}</div>
                        <div className="text-xs font-extralight text-luxury-cool-grey uppercase tracking-[0.2em]">
                          {p.productType || 'single'} / {p.productRole || 'main'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addLinked(p)}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors"
                      >
                        <LuPlus size={14} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          {visibleSections.variants && (
            <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                  Variants
                </div>
                <button
                  type="button"
                  onClick={() => setInput({
                    ...input,
                    variants: [...input.variants, { name: '', price: 0, image: '' }]
                  })}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors text-xs"
                >
                  <LuPlus size={14} /> Add Variant
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {input.variants.length === 0 && (
                  <div className="text-sm font-extralight text-luxury-cool-grey">No variants added.</div>
                )}
                {input.variants.map((variant, idx) => (
                  <div key={idx} className="border border-luxury-warm-grey/20 rounded-lg p-4 bg-luxury-warm-grey/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extralight text-luxury-cool-grey uppercase mb-1">Name</label>
                        <input
                          value={variant.name}
                          onChange={(e) => {
                            const next = [...input.variants];
                            next[idx].name = e.target.value;
                            setInput({ ...input, variants: next });
                          }}
                          className="w-full px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-1 focus:ring-brand-purple font-extralight text-sm"
                          placeholder="Small, Large..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extralight text-luxury-cool-grey uppercase mb-1">Price</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => {
                            const next = [...input.variants];
                            next[idx].price = Number(e.target.value);
                            setInput({ ...input, variants: next });
                          }}
                          className="w-full px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-1 focus:ring-brand-purple font-extralight text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-extralight text-luxury-cool-grey uppercase mb-1">Image URL</label>
                        <div className="flex gap-2">
                          <input
                            value={variant.image}
                            onChange={(e) => {
                              const next = [...input.variants];
                              next[idx].image = e.target.value;
                              setInput({ ...input, variants: next });
                            }}
                            className="flex-1 px-3 py-2 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-1 focus:ring-brand-purple font-extralight text-sm"
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            onClick={() => openMediaLibrary(false, 'product-image', (files) => {
                              if (files.length > 0) {
                                const next = [...input.variants];
                                next[idx].image = files[0].secure_url;
                                setInput({ ...input, variants: next });
                              }
                            })}
                            className="flex-none flex items-center justify-center px-3 py-2 border border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white cursor-pointer transition-colors"
                          >
                            <LuImagePlus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const next = input.variants.filter((_, i) => i !== idx);
                          setInput({ ...input, variants: next });
                        }}
                        className="text-red-500 text-xs uppercase font-extralight hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                Images
              </div>
              <button
                type="button"
                onClick={() => openMediaLibrary(true, 'product-image', (files) => {
                  if (files.length > 0) {
                    setInput((prev) => {
                      const existingCount = prev.images.length;
                      const newImages: ProductImage[] = files.map((f, i) => ({
                        url: f.secure_url,
                        isCover: existingCount === 0 && i === 0 // Make first one cover if initially empty
                      }));
                      return {
                        ...prev,
                        images: [...prev.images, ...newImages],
                        coverImage: existingCount === 0 ? newImages[0].url : prev.coverImage
                      };
                    });
                    useToastStore.getState().addToast({
                      type: 'success',
                      title: 'Images uploaded',
                      message: `${files.length} image(s) added to product.`,
                    });
                  }
                })}
                className="inline-flex items-center gap-2 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors cursor-pointer"
              >
                <LuImagePlus size={16} />
                Upload
              </button>
            </div>

            {input.images.length === 0 ? (
              <div className="mt-4 relative border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-white">
                {/* Upload indicator */}
                {/* {uploading && (
                  <div className="absolute top-0 left-0 right-0 z-50 bg-brand-purple/90 text-luxury-white">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-luxury-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-extralight uppercase tracking-[0.2em]">Uploading image...</span>
                    </div>
                    <div className="h-1 bg-brand-purple-light/30">
                      <div className="h-full bg-luxury-white animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                )} */}
                <div className="p-4 text-sm font-extralight text-luxury-cool-grey">
                  No images yet.
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Carousel */}
                <div className="relative border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-white">
                  {/* Upload indicator */}
                  {/* {uploading && (
                    <div className="absolute top-0 left-0 right-0 z-50 bg-brand-purple/90 text-luxury-white">
                      <div className="px-4 py-2 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-luxury-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-extralight uppercase tracking-[0.2em]">Uploading image...</span>
                      </div>
                      <div className="h-1 bg-brand-purple-light/30">
                        <div className="h-full bg-luxury-white animate-pulse" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  )} */}
                  <div className="relative w-full h-60 bg-luxury-warm-grey/10">
                    {input.images[currentImageIndex] && (
                      <>
                        <Image
                          src={input.images[currentImageIndex].url}
                          alt={`Product image ${currentImageIndex + 1}`}
                          fill
                          className="object-contain"
                          sizes="100vw"
                        />
                        {input.images[currentImageIndex].isCover && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-brand-purple text-luxury-white text-xs font-extralight uppercase tracking-[0.2em]">
                            Cover
                          </div>
                        )}
                      </>
                    )}

                    {/* Navigation arrows */}
                    {input.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? input.images.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          aria-label="Previous image"
                        >
                          <LuChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentImageIndex((prev) => (prev === input.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          aria-label="Next image"
                        >
                          <LuChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Image info and actions */}
                  <div className="p-3 space-y-2">
                    <div className="text-xs font-extralight text-luxury-black truncate">
                      {input.images[currentImageIndex]?.url}
                    </div>
                    <div className="flex items-center gap-2">
                      {!input.images[currentImageIndex]?.isCover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(currentImageIndex)}
                          className="flex-1 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors text-xs"
                        >
                          Set cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(currentImageIndex)}
                        className="px-3 py-2 border border-red-500 text-red-500 uppercase font-extralight hover:bg-red-500 hover:text-luxury-white transition-colors text-xs"
                        aria-label="Remove image"
                      >
                        <LuTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Carousel dots */}
                {input.images.length > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    {input.images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                          ? 'bg-brand-purple w-6'
                          : 'bg-luxury-cool-grey/30 hover:bg-luxury-cool-grey/50'
                          }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="flex flex-col gap-3">
              {/* Optional Section Toggles */}
              <div className="space-y-2 mb-2 pb-2 border-b border-luxury-warm-grey/20">
                {!visibleSections.variants && (
                  <button type="button" onClick={() => toggleSection('variants')} className="w-full text-left text-xs uppercase font-extralight tracking-[0.2em] text-brand-purple hover:underline">+ Add Variants</button>
                )}
                {!visibleSections.dimensions && (
                  <button type="button" onClick={() => toggleSection('dimensions')} className="w-full text-left text-xs uppercase font-extralight tracking-[0.2em] text-brand-purple hover:underline">+ Add Dimensions</button>
                )}
                {!visibleSections.materials && (
                  <button type="button" onClick={() => toggleSection('materials')} className="w-full text-left text-xs uppercase font-extralight tracking-[0.2em] text-brand-purple hover:underline">+ Add Materials</button>
                )}
                {!visibleSections.careInstructions && (
                  <button type="button" onClick={() => toggleSection('careInstructions')} className="w-full text-left text-xs uppercase font-extralight tracking-[0.2em] text-brand-purple hover:underline">+ Add Care Instructions</button>
                )}
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={saving || !input.name.trim() || !input.description.trim()}
                className="w-full px-4 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="w-full px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
              >
                Back to products
              </button>

              {canDelete && (
                <button
                  type="button"
                  onClick={deleteProduct}
                  className="w-full px-4 py-3 border border-red-500 text-red-500 uppercase font-extralight hover:bg-red-500 hover:text-white transition-colors duration-200"
                >
                  Delete product
                </button>
              )}

              {!isAdmin && mode === 'edit' && (
                <div className="text-xs font-extralight text-luxury-cool-grey">
                  Only admins can delete products.
                </div>
              )}
            </div>
          </div>

          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              Notes
            </div>
            <div className="mt-3 text-sm font-extralight text-luxury-cool-grey">
              - <span className="text-luxury-black">Standalone products</span>: use <span className="text-luxury-black">single + main</span>.
              <br />
              - <span className="text-luxury-black">Sub products</span>: use <span className="text-luxury-black">single + sub</span> and optionally assign a parent.
              <br />
              - <span className="text-luxury-black">Baskets</span>: use <span className="text-luxury-black">basket + main</span> and link the contents.
              <br />
              - <span className="text-luxury-black">Build Your Basket</span>: use <span className="text-luxury-black">custom + main</span>.
            </div>
          </div>
        </div>
      </div>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={onMediaSelect}
        multiple={mediaModalMultiple}
        uploadType={mediaModalType}
      />
    </div>
  );
}
