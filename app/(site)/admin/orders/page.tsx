'use client';

import { useEffect, useMemo, useState } from 'react';
import { LuRefreshCcw, LuSave } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import type { Order, OrderStatus } from '@/types/order';

type ListResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const statuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // per-row edits
  const [statusDraft, setStatusDraft] = useState<Record<string, OrderStatus>>({});
  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    return params.toString();
  }, [page, limit]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ListResponse>(`/api/orders/admin/list?${query}`, { method: 'GET' });
      setData(res);

      // initialize drafts
      const nextStatus: Record<string, OrderStatus> = {};
      const nextTracking: Record<string, string> = {};
      for (const o of res.items || []) {
        nextStatus[o.id] = o.status;
        nextTracking[o.id] = o.shipping?.trackingNumber || '';
      }
      setStatusDraft(nextStatus);
      setTrackingDraft(nextTracking);
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to load orders',
        message: e instanceof Error ? e.message : 'Could not load orders.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const save = async (id: string) => {
    try {
      setSavingId(id);
      const payload: { status?: OrderStatus; trackingNumber?: string } = {};
      payload.status = statusDraft[id];
      const tracking = (trackingDraft[id] || '').trim();
      if (tracking) payload.trackingNumber = tracking;

      const res = await apiFetch<{ item: Order }>(`/api/orders/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Order updated',
        message: `Order ${res.item.orderNumber} updated.`,
      });

      await load();
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Update failed',
        message: e instanceof Error ? e.message : 'Failed to update order.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Orders</h2>
          <p className="mt-2 text-luxury-cool-grey font-extralight">
            Track and update order statuses in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
        >
          <LuRefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-luxury-warm-grey/20 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
            {loading ? 'Loading…' : `${data?.total ?? 0} total`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-luxury-warm-grey/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Order</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Customer</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Total</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Tracking</th>
                <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((o) => {
                const customerName = `${o.shipping?.firstName || ''} ${o.shipping?.lastName || ''}`.trim();
                return (
                  <tr key={o.id} className="border-t border-luxury-warm-grey/10">
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">{o.orderNumber}</div>
                      <div className="text-xs font-extralight text-luxury-cool-grey">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">{customerName || '—'}</div>
                      <div className="text-xs font-extralight text-luxury-cool-grey">
                        {o.shipping?.country || ''} {o.shipping?.postalCode || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">{o.totals?.total ?? 0}</div>
                      <div className="text-xs font-extralight text-luxury-cool-grey">
                        Payment: {o.payment?.status || 'pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={statusDraft[o.id] || o.status}
                        onChange={(e) => setStatusDraft((prev) => ({ ...prev, [o.id]: e.target.value as OrderStatus }))}
                        className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        value={trackingDraft[o.id] ?? ''}
                        onChange={(e) => setTrackingDraft((prev) => ({ ...prev, [o.id]: e.target.value }))}
                        className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                        placeholder="DHL123…"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => save(o.id)}
                        disabled={savingId === o.id}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200 disabled:opacity-50"
                      >
                        <LuSave size={16} /> {savingId === o.id ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && (data?.items?.length || 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-luxury-cool-grey font-extralight">
                    No orders found.
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
