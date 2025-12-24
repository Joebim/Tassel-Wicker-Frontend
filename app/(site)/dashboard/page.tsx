'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuShoppingBag } from 'react-icons/lu';
import { useAuthStore } from '@/store/authStore';
import { backendOrders } from '@/services/backend';
import { useToastStore } from '@/store/toastStore';
import type { Order } from '@/types/order';

export default function Dashboard() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace('/login?redirect=/dashboard');
      return;
    }

    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await backendOrders.listMyOrders();
        if (!alive) return;
        setOrders(res.items || []);
      } catch (e) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Failed to load orders',
          message: e instanceof Error ? e.message : 'Could not load orders.',
        });
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [hasHydrated, user, router]);

  const title = useMemo(() => {
    if (!user) return 'Dashboard';
    const name = `${user.firstName} ${user.lastName}`.trim();
    return name ? `${name}'s Orders` : 'Your Orders';
  }, [user]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-luxury-cool-grey font-extralight">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-luxury-cool-grey font-extralight">Redirecting…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-luxury-black pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200 cursor-pointer mb-10"
        >
          <LuArrowLeft size={16} />
          <span className="font-extralight uppercase">Back</span>
        </button>

        <h1 className="text-5xl font-extralight uppercase tracking-wide text-luxury-black mb-4">
          {title}
        </h1>
        <p className="text-luxury-cool-grey font-extralight mb-10">
          View your recent orders.
        </p>

        <div className="border border-luxury-warm-grey/20 rounded-lg bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-luxury-warm-grey/20 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              {loading ? 'Loading…' : `${orders.length} orders`}
            </div>
            <Link
              href="/profile"
              className="text-xs uppercase tracking-[0.2em] text-brand-purple font-extralight hover:text-brand-purple-light transition-colors"
            >
              View profile
            </Link>
          </div>

          {orders.length === 0 && !loading ? (
            <div className="p-10 text-center">
              <LuShoppingBag size={40} className="mx-auto text-luxury-cool-grey mb-4" />
              <div className="text-luxury-black font-extralight uppercase">No orders yet</div>
              <div className="text-luxury-cool-grey font-extralight mt-2">
                When you place an order, it will appear here.
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center mt-6 px-6 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
              >
                Shop now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-luxury-warm-grey/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                      Order
                    </th>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                      Total
                    </th>
                    <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-luxury-warm-grey/10">
                      <td className="px-6 py-4">
                        <div className="text-sm font-extralight text-luxury-black">{o.orderNumber}</div>
                        <div className="text-xs font-extralight text-luxury-cool-grey">
                          {o.items?.length || 0} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-extralight text-luxury-black uppercase">
                        {o.status}
                      </td>
                      <td className="px-6 py-4 text-sm font-extralight text-luxury-black">
                        {o.totals?.total ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-extralight text-luxury-black">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

