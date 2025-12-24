'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LuLock, LuEye, LuEyeOff } from 'react-icons/lu';
import { useToastStore } from '@/store/toastStore';
import { apiFetch } from '@/services/apiClient';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenFromUrl = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Missing token',
        message: 'Please paste the reset token from your email.',
      });
      return;
    }

    if (password.length < 8) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Password too short',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Password mismatch',
        message: 'Passwords do not match. Please try again.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch<{ success: boolean }>('/api/auth/reset-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ token: token.trim(), newPassword: password }),
      });

      useToastStore.getState().addToast({
        type: 'success',
        title: 'Password updated',
        message: 'You can now sign in with your new password.',
      });
      router.replace('/login');
    } catch (err) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Reset failed',
        message: err instanceof Error ? err.message : 'Failed to reset password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h2 className="text-4xl font-extralight text-luxury-black mb-2 uppercase">Set new password</h2>
          <p className="text-luxury-cool-grey font-extralight">Paste your reset token and choose a new password</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 space-y-4"
          onSubmit={submit}
        >
          <div>
            <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Reset token</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
              placeholder="Paste token from email"
            />
          </div>

          <div>
            <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">New password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuLock className="h-5 w-5 text-luxury-cool-grey" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="Enter new password"
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <LuEyeOff className="h-5 w-5 text-luxury-cool-grey hover:text-luxury-black" />
                ) : (
                  <LuEye className="h-5 w-5 text-luxury-cool-grey hover:text-luxury-black" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Confirm password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuLock className="h-5 w-5 text-luxury-cool-grey" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="Confirm new password"
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <LuEyeOff className="h-5 w-5 text-luxury-cool-grey hover:text-luxury-black" />
                ) : (
                  <LuEye className="h-5 w-5 text-luxury-cool-grey hover:text-luxury-black" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-brand-purple text-brand-purple font-extralight uppercase hover:bg-brand-purple hover:text-luxury-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Updating…' : 'Update password'}
          </button>

          <div className="text-center text-sm font-extralight text-luxury-cool-grey">
            <Link href="/login" className="text-brand-purple hover:text-brand-purple-light transition-colors">Back to login</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-luxury-cool-grey font-extralight">Loading…</div></div>}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}




