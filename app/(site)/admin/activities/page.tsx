'use client';

import { useEffect, useMemo, useState } from 'react';
import { LuClock, LuUser, LuShoppingBag, LuPackage, LuFileText, LuTag, LuFilter, LuX } from 'react-icons/lu';
import { useActivities } from '@/hooks/useActivities';
import type { ActivityType } from '@/services/activitiesService';

const ACTIVITY_TYPES: { value: ActivityType | ''; label: string; category: string }[] = [
    { value: '', label: 'All Activities', category: 'All' },
    // User activities
    { value: 'user.registered', label: 'User Registered', category: 'User' },
    { value: 'user.login', label: 'User Login', category: 'User' },
    { value: 'user.login_failed', label: 'Login Failed', category: 'User' },
    { value: 'user.logout', label: 'User Logout', category: 'User' },
    { value: 'user.password_reset_requested', label: 'Password Reset Requested', category: 'User' },
    { value: 'user.password_reset', label: 'Password Reset', category: 'User' },
    // Order activities
    { value: 'order.created', label: 'Order Created', category: 'Order' },
    { value: 'order.updated', label: 'Order Updated', category: 'Order' },
    { value: 'order.cancelled', label: 'Order Cancelled', category: 'Order' },
    { value: 'order.payment_received', label: 'Payment Received', category: 'Order' },
    // Cart activities
    { value: 'cart.item_added', label: 'Item Added to Cart', category: 'Cart' },
    { value: 'cart.item_updated', label: 'Cart Item Updated', category: 'Cart' },
    { value: 'cart.item_removed', label: 'Item Removed from Cart', category: 'Cart' },
    { value: 'cart.cleared', label: 'Cart Cleared', category: 'Cart' },
    // Product activities
    { value: 'product.created', label: 'Product Created', category: 'Product' },
    { value: 'product.updated', label: 'Product Updated', category: 'Product' },
    { value: 'product.deleted', label: 'Product Deleted', category: 'Product' },
    // Content activities
    { value: 'content.updated', label: 'Content Updated', category: 'Content' },
    // Category activities
    { value: 'category.created', label: 'Category Created', category: 'Category' },
    { value: 'category.updated', label: 'Category Updated', category: 'Category' },
    { value: 'category.deleted', label: 'Category Deleted', category: 'Category' },
];

export default function AdminActivitiesPage() {
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [activityType, setActivityType] = useState<ActivityType | ''>('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { data, isLoading, error } = useActivities({
        page,
        limit,
        type: activityType || undefined,
        userId: userId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

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
        const activity = ACTIVITY_TYPES.find(a => a.value === type);
        return activity?.label || type;
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

    const clearFilters = () => {
        setActivityType('');
        setUserId('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const hasActiveFilters = activityType || userId || startDate || endDate;

    const activityCategories = useMemo(() => {
        const categories = new Set(ACTIVITY_TYPES.map(a => a.category));
        return Array.from(categories);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Activity Logs</h2>
                    <p className="mt-2 text-luxury-cool-grey font-extralight">
                        Complete system activity history with advanced filtering.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
                >
                    <LuFilter size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                            Filter Activities
                        </h3>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 text-xs text-luxury-cool-grey hover:text-brand-purple transition-colors font-extralight uppercase"
                            >
                                <LuX size={14} />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Activity Type Filter */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight mb-2">
                                Activity Type
                            </label>
                            <select
                                value={activityType}
                                onChange={(e) => {
                                    setActivityType(e.target.value as ActivityType | '');
                                    setPage(1);
                                }}
                                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                            >
                                {activityCategories.map(category => (
                                    <optgroup key={category} label={category}>
                                        {ACTIVITY_TYPES.filter(a => a.category === category).map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* User ID Filter */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight mb-2">
                                User ID
                            </label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => {
                                    setUserId(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Enter user ID..."
                                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                            />
                        </div>

                        {/* Start Date Filter */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight mb-2">
                                Start Date
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                            />
                        </div>

                        {/* End Date Filter */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight mb-2">
                                End Date
                            </label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Activities List */}
            <div className="border border-luxury-warm-grey/20 rounded-lg bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-luxury-warm-grey/20 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                        {isLoading ? 'Loading…' : `${pagination?.total ?? 0} total activities`}
                    </div>
                    {hasActiveFilters && (
                        <div className="text-xs font-extralight text-brand-purple">
                            Filters active
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                            Loading activities…
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-sm text-red-500 font-extralight">
                            Failed to load activities. Please try again.
                        </div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-sm text-luxury-cool-grey font-extralight">
                            No activities found.
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-luxury-warm-grey/10">
                        {activities.map((activity) => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-6 hover:bg-luxury-warm-grey/5 transition-colors"
                                >
                                    <div className="shrink-0 mt-0.5">
                                        <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center">
                                            <Icon size={18} className="text-brand-purple" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-extralight text-luxury-black mb-1">
                                                    {getActivityLabel(activity.type)}
                                                </div>
                                                <div className="text-xs font-extralight text-luxury-cool-grey">
                                                    {getActivityDescription(activity)}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-xs font-extralight text-luxury-cool-grey">
                                                {formatDate(activity.createdAt)}
                                            </div>
                                        </div>
                                        {activity.ipAddress && (
                                            <div className="text-xs font-extralight text-luxury-cool-grey/70">
                                                IP: {activity.ipAddress}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-luxury-warm-grey/20 flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={pagination.page <= 1}
                                className="px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
