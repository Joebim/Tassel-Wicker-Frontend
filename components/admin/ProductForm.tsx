'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LuImagePlus, LuTrash2, LuX, LuSearch, LuPlus, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { Product, ProductCategory } from '@/types/product';

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
  images: string[];
  coverImage?: string;
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
  const [uploading, setUploading] = useState(false);

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
        setInput({
          externalId: (p as any).externalId,
          name: p.name || '',
          description: p.description || '',
          price: Number(p.price || 0),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
          images: Array.isArray(p.images) ? p.images : [],
          coverImage: (p as any).coverImage,
          categoryId: (p as any).categoryId,
          category: p.category,
          productType: ((p as any).productType || 'single') as ProductType,
          productRole: ((p as any).productRole || 'main') as ProductRole,
          parentProductId: ((p as any).parentProductId || undefined) as any,
          linkedProductIds: Array.isArray((p as any).linkedProductIds) ? ((p as any).linkedProductIds as string[]) : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          inStock: !!p.inStock,
          stockQuantity: Number(p.stockQuantity || 0),
          featured: !!p.featured,
          isNew: !!(p as any).isNew,
          isCustom: !!(p as any).isCustom,
        });

        const linked = (data.linkedProducts || []).map((lp) => ({
          id: lp.id,
          name: lp.name,
          productType: lp.productType as any,
          productRole: lp.productRole as any,
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
              productType: p.productType as any,
              productRole: p.productRole as any,
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
              productType: p.productType as any,
              productRole: p.productRole as any,
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
        const nextImages = [...prev.images, res.url];
        return { ...prev, images: nextImages, coverImage: prev.coverImage || res.url };
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

  const removeImage = (url: string) => {
    setInput((prev) => {
      const images = prev.images.filter((i) => i !== url);
      const coverImage = prev.coverImage === url ? images[0] : prev.coverImage;
      return { ...prev, images, coverImage };
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
        images: input.images,
        coverImage: input.coverImage || undefined,
        categoryId: input.categoryId || undefined,
        category: categoryName || undefined,
        productType: input.productType,
        productRole: input.productRole,
        parentProductId: input.productRole === 'sub' ? (input.parentProductId || undefined) : undefined,
        linkedProductIds: input.linkedProductIds,
        tags: input.tags,
        inStock: input.inStock,
        stockQuantity: Number(input.stockQuantity),
        featured: input.featured,
        isNew: input.isNew,
        isCustom: input.isCustom,
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
    const ok = window.confirm('Delete this product? This cannot be undone.');
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
                  onChange={(e) => setInput({ ...input, categoryId: e.target.value || undefined })}
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
                  value={input.tags.join(', ')}
                  onChange={(e) =>
                    setInput({
                      ...input,
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                  placeholder="luxury, gift, limited…"
                />
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
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                Images
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors cursor-pointer">
                <LuImagePlus size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {input.images.length === 0 ? (
              <div className="mt-4 relative border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-white">
                {/* Upload indicator */}
                {uploading && (
                  <div className="absolute top-0 left-0 right-0 z-50 bg-brand-purple/90 text-luxury-white">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-luxury-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-extralight uppercase tracking-[0.2em]">Uploading image...</span>
                    </div>
                    <div className="h-1 bg-brand-purple-light/30">
                      <div className="h-full bg-luxury-white animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                )}
                <div className="p-4 text-sm font-extralight text-luxury-cool-grey">
                  No images yet.
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Carousel */}
                <div className="relative border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-white">
                  {/* Upload indicator */}
                  {uploading && (
                    <div className="absolute top-0 left-0 right-0 z-50 bg-brand-purple/90 text-luxury-white">
                      <div className="px-4 py-2 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-luxury-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-extralight uppercase tracking-[0.2em]">Uploading image...</span>
                      </div>
                      <div className="h-1 bg-brand-purple-light/30">
                        <div className="h-full bg-luxury-white animate-pulse" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  )}
                  <div className="relative w-full h-60 bg-luxury-warm-grey/10">
                    {input.images[currentImageIndex] && (
                      <>
                        <Image
                          src={input.images[currentImageIndex]}
                          alt={`Product image ${currentImageIndex + 1}`}
                          fill
                          className="object-contain"
                          sizes="100vw"
                        />
                        {input.coverImage === input.images[currentImageIndex] && (
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
                      {input.images[currentImageIndex]}
                    </div>
                    <div className="flex items-center gap-2">
                      {input.coverImage !== input.images[currentImageIndex] && (
                        <button
                          type="button"
                          onClick={() => setInput({ ...input, coverImage: input.images[currentImageIndex] })}
                          className="flex-1 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors text-xs"
                        >
                          Set cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const urlToRemove = input.images[currentImageIndex];
                          removeImage(urlToRemove);
                          if (currentImageIndex > 0) {
                            setCurrentImageIndex(currentImageIndex - 1);
                          } else if (input.images.length > 1) {
                            setCurrentImageIndex(0);
                          }
                        }}
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
    </div>
  );
}
