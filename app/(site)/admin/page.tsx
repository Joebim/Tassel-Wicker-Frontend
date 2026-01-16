'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LuArrowRight, LuClock, LuUser, LuShoppingBag, LuPackage, LuFileText, LuTag } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import { useActivities } from '@/hooks/useActivities';
import type { ActivityType } from '@/services/activitiesService';

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

      {/* Activity Logs */}
      <ActivityLogsSection />
    </div>
  );
}

function ActivityLogsSection() {
  const { data, isLoading, error } = useActivities({ page: 1, limit: 10 });
  const activities = data?.activities || [];
  const pagination = data?.pagination;

  const getActivityIcon = (type: ActivityType) => {
    if (type.startsWith('user.')) return LuUser;
    if (type.startsWith('order.')) return LuShoppingBag;
    if (type.startsWith('product.')) return LuPackage;
    if (type.startsWith('cart.')) return LuShoppingBag;
    if (type.startsWith('content.')) return LuFileText;
    if (type.startsWith('category.')) return LuTag;
    return LuClock;
  };

  const getCurrencySymbol = (currency?: string): string => {
    const symbols: Record<string, string> = {
      GBP: "£",
      USD: "$",
      EUR: "€",
      NGN: "₦",
      CAD: "CA$",
      AUD: "A$",
    };
    const code = currency?.toUpperCase() || "GBP";
    return symbols[code] || code;
  };

  const getActivityLabel = (type: ActivityType) => {
    const labels: Record<string, string> = {
      'user.registered': 'User Registered',
      'user.login': 'User Login',
      'user.login_failed': 'Login Failed',
      'user.logout': 'User Logout',
      'user.password_reset_requested': 'Password Reset Requested',
      'user.password_reset': 'Password Reset',
      'order.created': 'Order Created',
      'order.updated': 'Order Updated',
      'order.cancelled': 'Order Cancelled',
      'order.payment_received': 'Payment Received',
      'cart.item_added': 'Item Added to Cart',
      'cart.item_updated': 'Cart Item Updated',
      'cart.item_removed': 'Item Removed from Cart',
      'cart.cleared': 'Cart Cleared',
      'product.created': 'Product Created',
      'product.updated': 'Product Updated',
      'product.deleted': 'Product Deleted',
      'content.updated': 'Content Updated',
      'category.created': 'Category Created',
      'category.updated': 'Category Updated',
      'category.deleted': 'Category Deleted',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getUserDisplayName = (activity: any) => {
    if (activity.user?.fullName) {
      return activity.user.fullName;
    }
    if (activity.user?.firstName || activity.user?.lastName) {
      return `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim();
    }
    if (activity.user?.email) {
      return activity.user.email;
    }
    if (activity.metadata?.email) {
      return activity.metadata.email;
    }
    return 'Guest user';
  };

  const getActivityDescription = (activity: any) => {
    const { type, metadata } = activity;
    const userName = getUserDisplayName(activity);

    if (type === 'user.registered' || type === 'user.login' || type === 'user.login_failed') {
      return userName;
    }

    if (type.startsWith('order.')) {
      if (metadata?.orderNumber) {
        const symbol = getCurrencySymbol(metadata.currency);
        return `${userName} - Order ${metadata.orderNumber}${metadata.total ? ` - ${symbol}${metadata.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}`;
      }
      return `${userName} - ${metadata?.orderId || 'Order activity'}`;
    }

    if (type.startsWith('cart.')) {
      if (metadata?.productName) {
        return `${userName} - ${metadata.productName}${metadata.quantity ? ` (x${metadata.quantity})` : ''}`;
      }
      return `${userName} - Cart activity`;
    }

    if (type.startsWith('product.')) {
      return `${userName} - ${metadata?.productName || 'Product activity'}`;
    }

    if (type.startsWith('content.') || type.startsWith('category.')) {
      return userName;
    }

    return userName;
  };

  return (
    <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
            Recent Activity
          </div>
          <div className="mt-2 text-luxury-black font-extralight">
            Latest system activities and user interactions.
          </div>
        </div>
        <Link
          href="/admin/activities"
          className="px-4 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200 text-sm"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
            Loading activities…
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-sm text-red-500 font-extralight">
            Failed to load activities. Please try again.
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-luxury-cool-grey font-extralight">
            No activities found.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border border-luxury-warm-grey/10 rounded-lg hover:border-luxury-warm-grey/20 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                    <Icon size={16} className="text-brand-purple" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extralight text-luxury-black">
                        {getActivityLabel(activity.type)}
                      </div>
                      <div className="text-xs font-extralight text-luxury-cool-grey mt-1">
                        {getActivityDescription(activity)}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-xs font-extralight text-luxury-cool-grey">
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>
                  {activity.ipAddress && (
                    <div className="mt-2 text-xs font-extralight text-luxury-cool-grey">
                      IP: {activity.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-luxury-warm-grey/20 text-center">
          <Link
            href="/admin/activities"
            className="text-sm text-brand-purple hover:text-brand-purple-light font-extralight uppercase tracking-wide"
          >
            View all {pagination.total} activities →
          </Link>
        </div>
      )}
    </div>
  );
}

