'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuMail, LuLock, LuEye, LuEyeOff, LuUser } from 'react-icons/lu';
import { authService } from '@/services/authService';
import { useToastStore } from '@/store/toastStore';

export default function Signup() {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            useToastStore.getState().addToast({
                type: "error",
                title: "Password Mismatch",
                message: "Passwords do not match. Please try again.",
            });
            return;
        }

        if (formData.password.length < 6) {
            useToastStore.getState().addToast({
                type: "error",
                title: "Password Too Short",
                message: "Password must be at least 6 characters long.",
            });
            return;
        }

        setIsLoading(true);

        const result = await authService.signUp(formData.email, formData.password, formData.displayName);

        if (result.success) {
            router.push('/');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-luxury-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-extralight text-luxury-black mb-2 uppercase">
                        Create Account
                    </h2>
                    <p className="text-luxury-cool-grey font-extralight">
                        Join us for an exclusive experience
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
                            <label htmlFor="displayName" className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LuUser className="h-5 w-5 text-luxury-cool-grey" />
                                </div>
                                <input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    required
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-luxury-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-luxury-cool-grey bg-luxury-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
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
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-12 py-3 border border-luxury-cool-grey bg-luxury-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    placeholder="Create a password"
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LuLock className="h-5 w-5 text-luxury-cool-grey" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-12 py-3 border border-luxury-cool-grey bg-luxury-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
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
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-luxury-cool-grey font-extralight">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-luxury-black hover:text-brand-purple transition-colors font-extralight"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}

