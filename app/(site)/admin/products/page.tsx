'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LuPlus, LuSearch, LuTrash2, LuPencil, LuExternalLink } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types/product';

type ProductType = 'basket' | 'custom' | 'single' | '';
type ProductRole = 'main' | 'sub' | '';

type ListResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminProductsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [type, setType] = useState<ProductType>('');
  const [role, setRole] = useState<ProductRole>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search.trim()) params.set('search', search.trim());
    if (type) params.set('type', type);
    if (role) params.set('role', role);
    return params.toString();
  }, [page, limit, search, type, role]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiFetch<ListResponse>(`/api/products?${query}`, { method: 'GET' });
        if (!alive) return;
        setData(res);
      } catch (e) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Failed to load products',
          message: e instanceof Error ? e.message : 'Could not load products.',
        });
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [query]);

  const deleteProduct = async (id: string) => {
    if (!isAdmin) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Admin only',
        message: 'Only admins can delete products.',
      });
      return;
    }

    const ok = window.confirm('Delete this product? This cannot be undone.');
    if (!ok) return;

    try {
      await apiFetch<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' });
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Product deleted',
        message: 'The product was deleted successfully.',
      });
      // refresh
      const res = await apiFetch<ListResponse>(`/api/products?${query}`, { method: 'GET' });
      setData(res);
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Delete failed',
        message: e instanceof Error ? e.message : 'Failed to delete product.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Products</h2>
          <p className="mt-2 text-luxury-cool-grey font-extralight">
            Manage standalone products, baskets, and custom products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200"
        >
          <LuPlus size={16} /> New product
        </Link>
      </div>

      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <div className="relative">
              <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-cool-grey" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="Search by name, description, tags…"
              />
            </div>
          </div>

          <div>
            <select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value as ProductType);
              }}
              className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
            >
              <option value="">All types</option>
              <option value="basket">Basket</option>
              <option value="custom">Custom</option>
              <option value="single">Single</option>
            </select>
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value as ProductRole);
              }}
              className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
            >
              <option value="">All roles</option>
              <option value="main">Main</option>
              <option value="sub">Sub</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-luxury-warm-grey/20 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
            {loading ? 'Loading…' : `${data?.total ?? 0} total`}
          </div>
          {!isAdmin && (
            <div className="text-xs font-extralight text-luxury-cool-grey">
              Moderators can create/update products but cannot delete.
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-luxury-warm-grey/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Image
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Product
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Type / Role
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Price
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Stock
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Flags
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((p) => {
                const productImage = p.coverImage || (p.images && p.images.length > 0 ? p.images[0] : null);
                return (
                  <tr key={p.id} className="border-t border-luxury-warm-grey/10">
                    <td className="px-6 py-4">
                      {productImage ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-luxury-warm-grey/20">
                          <Image
                            src={productImage}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-luxury-warm-grey/20 bg-luxury-warm-grey/10 flex items-center justify-center">
                          <span className="text-xs text-luxury-cool-grey font-extralight">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">{p.name}</div>
                      <div className="text-xs font-extralight text-luxury-cool-grey truncate max-w-[420px]">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black uppercase">
                        {p.productType || 'single'} / {p.productRole || 'main'}
                      </div>
                      <div className="text-xs font-extralight text-luxury-cool-grey">
                        {p.category || 'No category'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">{p.price}</div>
                      {p.originalPrice ? (
                        <div className="text-xs font-extralight text-luxury-cool-grey line-through">
                          {p.originalPrice}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">
                        {p.inStock ? 'In stock' : 'Out of stock'}
                      </div>
                      <div className="text-xs font-extralight text-luxury-cool-grey">
                        Qty: {p.stockQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-extralight text-luxury-cool-grey uppercase tracking-[0.2em]">
                        {p.featured ? 'Featured' : '—'}
                        {p.isNew ? ' · New' : ''}
                        {p.isCustom ? ' · Custom' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 border border-luxury-warm-grey/20 text-luxury-black uppercase font-extralight hover:bg-luxury-warm-grey/10 transition-colors"
                          title="View on live site"
                        >
                          <LuExternalLink size={14} /> View
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors"
                        >
                          <LuPencil size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className={
                            'inline-flex items-center gap-2 px-3 py-2 border uppercase font-extralight transition-colors ' +
                            (isAdmin
                              ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                              : 'border-luxury-warm-grey/20 text-luxury-cool-grey cursor-not-allowed')
                          }
                          disabled={!isAdmin}
                          title={isAdmin ? 'Delete' : 'Admin only'}
                        >
                          <LuTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && (data?.items?.length || 0) === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-luxury-cool-grey font-extralight">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-luxury-warm-grey/20 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
            Page {data?.page ?? page} of {data?.totalPages ?? 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={(data?.page ?? page) <= 1}
              className="px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={(data?.page ?? page) >= (data?.totalPages ?? 1)}
              className="px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
