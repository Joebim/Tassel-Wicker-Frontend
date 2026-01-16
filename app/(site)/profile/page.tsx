'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuUser, LuMail, LuShield, LuLogOut, LuPencil, LuSave, LuX, LuPhone } from 'react-icons/lu';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import type { User } from '@/types/user';
import { updateMyProfile } from '@/services/backend/users';

export default function ProfilePage() {
  const router = useRouter();
  const { user, hasHydrated, setUser } = useAuthStore();
  const [freshUser, setFreshUser] = useState<User | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

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
        // Also update store if different to keep them in sync
        setUser(res.user);
      } catch {
        // ignore; store still has user
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [hasHydrated, user, router, setUser]);

  // Initialize form data when entering edit mode or when user loads
  useEffect(() => {
    if (displayUser && !isEditing) {
      setFormData({
        firstName: displayUser.firstName,
        lastName: displayUser.lastName,
        phone: displayUser.phone || '',
      });
    }
  }, [displayUser, isEditing]);

  const fullName = useMemo(() => {
    if (!displayUser) return '';
    return `${displayUser.firstName} ${displayUser.lastName}`.trim();
  }, [displayUser]);

  const handleSave = async () => {
    if (!displayUser) return;

    setSaving(true);
    try {
      const { item: updatedUser } = await updateMyProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      setFreshUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
      });
    } catch (error) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Could not update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-5xl font-extralight uppercase tracking-wide text-luxury-black mb-4">Profile</h1>
            <p className="text-luxury-cool-grey font-extralight">Your account details</p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-luxury-warm-grey/20 text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200 inline-flex items-center gap-2"
            >
              <LuPencil size={16} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-luxury-warm-grey/20 text-luxury-cool-grey uppercase font-extralight hover:bg-luxury-warm-grey/10 transition-colors duration-200 inline-flex items-center gap-2"
                disabled={saving}
              >
                <LuX size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50"
                disabled={saving}
              >
                <LuSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-luxury-warm-grey/20 rounded-lg bg-white p-6 relative overflow-hidden">
            {isEditing && (
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple/20"></div>
            )}
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight flex justify-between">
              <span>User Information</span>
              {isEditing && <span className="text-brand-purple">Editing mode</span>}
            </div>

            <div className="mt-6 space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-purple/5 flex items-center justify-center shrink-0 mt-1">
                  <LuUser className="text-brand-purple" size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey mb-1">Name</div>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="First Name"
                          className="w-full px-3 py-2 border border-luxury-warm-grey/20 rounded focus:outline-none focus:border-brand-purple/50 font-extralight text-lg"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 border border-luxury-warm-grey/20 rounded focus:outline-none focus:border-brand-purple/50 font-extralight text-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-extralight text-luxury-black">{fullName || '—'}</div>
                  )}
                </div>
              </div>

              {/* Email (Read only) */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-purple/5 flex items-center justify-center shrink-0 mt-1">
                  <LuMail className="text-brand-purple" size={20} />
                </div>
                <div>
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey mb-1">Email <span className="text-[10px] normal-case opacity-60">(Cannot be changed)</span></div>
                  <div className="text-lg font-extralight text-luxury-black">{displayUser.email}</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-purple/5 flex items-center justify-center shrink-0 mt-1">
                  <LuPhone className="text-brand-purple" size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey mb-1">Phone Number</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 7000 000000"
                      className="w-full max-w-md px-3 py-2 border border-luxury-warm-grey/20 rounded focus:outline-none focus:border-brand-purple/50 font-extralight text-lg"
                    />
                  ) : (
                    <div className="text-lg font-extralight text-luxury-black">{displayUser.phone || <span className="text-luxury-cool-grey/50 italic">Not set</span>}</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-luxury-warm-grey/10">
                <div className="w-10 h-10 rounded-full bg-brand-purple/5 flex items-center justify-center shrink-0 mt-1">
                  <LuShield className="text-brand-purple" size={20} />
                </div>
                <div>
                  <div className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey mb-1">Role</div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wide bg-luxury-warm-grey/5 text-luxury-cool-grey border-luxury-warm-grey/20">
                    {displayUser.role}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs font-extralight text-luxury-cool-grey">
                User ID: <span className="text-luxury-black">{displayUser.id}</span>
              </div>
            </div>
          </div>

          <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6 h-fit">
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
