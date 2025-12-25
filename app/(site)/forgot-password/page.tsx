'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LuMail } from 'react-icons/lu';
import { useToastStore } from '@/store/toastStore';
import { apiFetch } from '@/services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiFetch<{ success: boolean }>('/api/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email: email.trim() }),
      });

      // Backend always returns success (prevents account enumeration)
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Check your inbox',
        message: 'If an account exists for that email, you will receive password reset instructions shortly.',
      });
      setEmail('');
    } catch (err) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Request failed',
        message: err instanceof Error ? err.message : 'Failed to request password reset.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h2 className="text-4xl font-extralight text-luxury-black mb-2 uppercase">Reset Password</h2>
          <p className="text-luxury-cool-grey font-extralight">Enter your email to receive a reset link</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={submit}
        >
          <div>
            <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuMail className="h-5 w-5 text-luxury-cool-grey" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-brand-purple text-brand-purple font-extralight uppercase hover:bg-brand-purple hover:text-luxury-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Sending…' : 'Send reset email'}
          </button>

          <div className="text-center text-sm font-extralight text-luxury-cool-grey">
            <Link href="/login" className="text-brand-purple hover:text-brand-purple-light transition-colors">Back to login</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}





