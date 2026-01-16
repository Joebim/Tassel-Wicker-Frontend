'use client';

import { useEffect, useMemo, useState } from 'react';
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
  LuExternalLink,
  LuMenu,
  LuChevronLeft,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize collapse state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-white text-luxury-black flex flex-col">
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <aside
          className={`
            ${isCollapsed ? 'w-20' : 'w-72'} 
            transition-all duration-300 ease-in-out
            border-r border-luxury-warm-grey/20 bg-white flex flex-col
            fixed lg:static h-full z-20
            ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          `}
        >
          <div className="px-6 py-6 border-b border-luxury-warm-grey/20 h-24 flex flex-col justify-center overflow-hidden">
            {!isCollapsed ? (
              <>
                <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight whitespace-nowrap">
                  Tassel & Wicker
                </div>
                <div className="text-2xl uppercase tracking-wider font-extralight text-luxury-black whitespace-nowrap">
                  Admin
                </div>
              </>
            ) : (
              <div className="text-xl font-light tracking-tighter text-luxury-black text-center">
                T&W
              </div>
            )}
          </div>

          <nav className="p-4 space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const normalizedPath = pathname?.split('?')[0].replace(/\/$/, '') || '';
              const normalizedHref = item.href.replace(/\/$/, '');

              const active = normalizedHref === '/admin'
                ? normalizedPath === normalizedHref
                : normalizedPath === normalizedHref || normalizedPath?.startsWith(normalizedHref + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : ''}
                  className={
                    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 ` +
                    (active
                      ? 'bg-brand-purple text-luxury-white'
                      : 'text-luxury-black hover:bg-luxury-warm-grey/10')
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="font-extralight uppercase text-sm tracking-wide whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 border-t border-luxury-warm-grey/20 overflow-hidden">
            {!isCollapsed && (
              <div className="px-2 py-2 mb-2">
                <div className="text-sm font-extralight text-luxury-black truncate">{userDisplayName}</div>
                <div className="text-xs font-extralight text-luxury-cool-grey uppercase tracking-wide truncate">
                  {user.role}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                await authService.logout();
                router.replace('/');
              }}
              className={`
                w-full flex items-center justify-center gap-2 border border-brand-purple text-brand-purple 
                uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white 
                transition-colors duration-200
                ${isCollapsed ? 'aspect-square p-0' : 'px-4 py-3'}
              `}
              title={isCollapsed ? "Sign out" : ""}
            >
              <LuLogOut size={16} />
              {!isCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {!isCollapsed && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-luxury-warm-grey/20">
            <div className="px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 -ml-2 hover:bg-luxury-warm-grey/10 rounded-lg transition-colors text-luxury-black"
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isCollapsed ? <LuMenu size={24} /> : <LuChevronLeft size={24} />}
                </button>
                <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
                  Dashboard
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200 text-sm"
                >
                  <LuExternalLink size={14} />
                  View Live Site
                </Link>
                <div className="text-right">
                  <div className="text-sm font-extralight text-luxury-black">{user.email}</div>
                  <div className="text-xs font-extralight text-luxury-cool-grey">API: {process.env.NEXT_PUBLIC_API_BASE_URL ? 'external' : 'same-origin'}</div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
