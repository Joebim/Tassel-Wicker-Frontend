'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';

export const dynamic = 'force-dynamic';

export default function Admin() {
  return <AdminOverview />;
}

type Counts = {
  products: number;
  categories: number;
  orders: number;
};

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block border border-luxury-warm-grey/20 rounded-lg bg-white p-6 hover:border-brand-purple/40 transition-colors"
    >
      <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div className="text-4xl font-extralight text-luxury-black">{value}</div>
        <div className="flex items-center gap-2 text-brand-purple font-extralight uppercase text-xs tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
          Manage <LuArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

function AdminOverview() {
  const [counts, setCounts] = useState<Counts>({ products: 0, categories: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const [products, categories, orders] = await Promise.all([
          apiFetch<{ total: number }>('/api/products?limit=1&page=1', { method: 'GET' }),
          apiFetch<{ items: unknown[] }>('/api/categories', { method: 'GET' }),
          apiFetch<{ total: number }>('/api/orders/admin/list?limit=1&page=1', { method: 'GET' }),
        ]);

        if (!alive) return;
        setCounts({
          products: products.total ?? 0,
          categories: Array.isArray(categories.items) ? categories.items.length : 0,
          orders: orders.total ?? 0,
        });
      } catch (e) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Dashboard Load Failed',
          message: e instanceof Error ? e.message : 'Failed to load admin overview.',
        });
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(
    () => [
      { label: 'Products', value: counts.products, href: '/admin/products' },
      { label: 'Categories', value: counts.categories, href: '/admin/categories' },
      { label: 'Orders', value: counts.orders, href: '/admin/orders' },
    ],
    [counts]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">
          Overview
        </h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Quick snapshot of store activity and inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((i) => (
          <StatCard key={i.label} label={i.label} value={i.value} href={i.href} />
        ))}
      </div>

      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              Quick actions
            </div>
            <div className="mt-2 text-luxury-black font-extralight">
              Create products, manage categories, and process orders.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="px-4 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200"
            >
              New product
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
            >
              View orders
            </Link>
          </div>
        </div>
        {loading && (
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
            Loading stats…
          </div>
        )}
      </div>
    </div>
  );
}

