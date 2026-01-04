'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuUser, LuMail, LuShield, LuLogOut } from 'react-icons/lu';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import type { User } from '@/types/user';

export default function ProfilePage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const [freshUser, setFreshUser] = useState<User | null>(null);

  const displayUser = freshUser || user;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace('/login?redirect=/profile');
      return;
    }

    let alive = true;
    const load = async () => {
      try {
        const res = await apiFetch<{ user: User }>('/api/auth/me', { method: 'GET', auth: true });
        if (!alive) return;
        setFreshUser(res.user);
      } catch {
        // ignore; store still has user
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [hasHydrated, user, router]);

  const fullName = useMemo(() => {
    if (!displayUser) return '';
    return `${displayUser.firstName} ${displayUser.lastName}`.trim();
  }, [displayUser]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-luxury-cool-grey font-extralight">Loading…</div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-luxury-cool-grey font-extralight">Redirecting…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-luxury-black pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h1 className="text-5xl font-extralight uppercase tracking-wide text-luxury-black mb-4">Profile</h1>
        <p className="text-luxury-cool-grey font-extralight mb-10">Your account details</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">User</div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <LuUser className="mt-1 text-luxury-cool-grey" size={18} />
                <div>
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey">Name</div>
                  <div className="text-lg font-extralight text-luxury-black">{fullName || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <LuMail className="mt-1 text-luxury-cool-grey" size={18} />
                <div>
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey">Email</div>
                  <div className="text-lg font-extralight text-luxury-black">{displayUser.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <LuShield className="mt-1 text-luxury-cool-grey" size={18} />
                <div>
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey">Role</div>
                  <div className="text-lg font-extralight text-luxury-black">{displayUser.role}</div>
                </div>
              </div>

              <div className="pt-2 text-xs font-extralight text-luxury-cool-grey">
                User ID: <span className="text-luxury-black">{displayUser.id}</span>
              </div>
            </div>
          </div>

          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">Actions</div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
              >
                View orders
              </button>

              {(displayUser.role === 'admin' || displayUser.role === 'moderator') && (
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="w-full px-4 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200"
                >
                  Go to admin
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  await authService.logout();
                  useToastStore.getState().addToast({
                    type: 'info',
                    title: 'Signed out',
                    message: 'You have been signed out successfully.',
                  });
                  router.replace('/');
                }}
                className="w-full px-4 py-3 border border-luxury-warm-grey/40 text-luxury-black uppercase font-extralight hover:bg-luxury-warm-grey/10 transition-colors duration-200 inline-flex items-center justify-center gap-2"
              >
                <LuLogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









