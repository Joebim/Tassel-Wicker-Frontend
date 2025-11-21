'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LuMail, LuLock, LuEye, LuEyeOff } from 'react-icons/lu';
import { authService } from '@/services/authService';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await authService.signIn(email, password);

        if (result.success) {
            // Redirect to the specified page or home
            const redirectTo = searchParams.get('redirect') || '/';
            router.push(redirectTo);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-extralight text-luxury-black mb-2 uppercase">
                        Welcome Back
                    </h2>
                    <p className="text-luxury-cool-grey font-extralight">
                        Sign in to your account
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LuMail className="h-5 w-5 text-luxury-cool-grey" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LuLock className="h-5 w-5 text-luxury-cool-grey" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <LuEyeOff className="h-5 w-5 text-luxury-cool-grey hover:text-luxury-black" />
                                    ) : (
                                        <LuEye className="h-5 w-5 text-luxury-cool-grey hover:text-luxury-black" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-brand-purple text-brand-purple font-extralight uppercase hover:bg-brand-purple hover:text-luxury-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-colors duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-luxury-cool-grey font-extralight">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/signup"
                                className="text-brand-purple hover:text-brand-purple-light transition-colors font-extralight"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-luxury-cool-grey font-extralight">Loading...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

