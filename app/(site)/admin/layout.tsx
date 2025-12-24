'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LuLayoutDashboard,
  LuPackage,
  LuTags,
  LuShoppingBag,
  LuUsers,
  LuLogOut,
  LuFileText,
} from 'react-icons/lu';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { authService } from '@/services/authService';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LuLayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: LuPackage },
  { href: '/admin/categories', label: 'Categories', icon: LuTags },
  { href: '/admin/orders', label: 'Orders', icon: LuShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: LuUsers },
  { href: '/admin/content', label: 'Content', icon: LuFileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydrated, isLoading } = useAuthStore();

  const canAccess = useMemo(() => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'moderator';
  }, [user]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in with an admin account to access the dashboard.',
      });
      router.replace('/login?redirect=/admin');
      return;
    }

    if (!canAccess) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have permission to access the admin dashboard.',
      });
      router.replace('/');
    }
  }, [hasHydrated, user, canAccess, router]);

  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-luxury-cool-grey font-extralight">Loading…</div>
      </div>
    );
  }

  if (!user || !canAccess) {
    // We are redirecting in an effect; keep UI minimal.
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-luxury-cool-grey font-extralight">Redirecting…</div>
      </div>
    );
  }

  const userDisplayName = `${user.firstName} ${user.lastName}`.trim() || user.email;

  return (
    <div className="min-h-screen bg-white text-luxury-black">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 border-r border-luxury-warm-grey/20 bg-white">
          <div className="px-6 py-6 border-b border-luxury-warm-grey/20">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              Tassel & Wicker
            </div>
            <div className="text-2xl uppercase tracking-wider font-extralight text-luxury-black">
              Admin
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Normalize pathname (remove trailing slash, query params)
              const normalizedPath = pathname?.split('?')[0].replace(/\/$/, '') || '';
              const normalizedHref = item.href.replace(/\/$/, '');

              // For Overview (/admin), only match exact path
              // For other items, match exact path or paths starting with item.href + '/'
              const active = normalizedHref === '/admin'
                ? normalizedPath === normalizedHref
                : normalizedPath === normalizedHref || normalizedPath?.startsWith(normalizedHref + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ` +
                    (active
                      ? 'bg-brand-purple text-luxury-white'
                      : 'text-luxury-black hover:bg-luxury-warm-grey/10')
                  }
                >
                  <Icon size={18} />
                  <span className="font-extralight uppercase text-sm tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 border-t border-luxury-warm-grey/20">
            <div className="px-2 py-2">
              <div className="text-sm font-extralight text-luxury-black">{userDisplayName}</div>
              <div className="text-xs font-extralight text-luxury-cool-grey uppercase tracking-wide">
                {user.role}
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await authService.logout();
                router.replace('/');
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
            >
              <LuLogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-luxury-warm-grey/20">
            <div className="px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                  Dashboard
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extralight text-luxury-black">{user.email}</div>
                <div className="text-xs font-extralight text-luxury-cool-grey">API: {process.env.NEXT_PUBLIC_API_BASE_URL ? 'external' : 'same-origin'}</div>
              </div>
            </div>
          </header>

          <main className="px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
