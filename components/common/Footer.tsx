'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaInstagram, FaPinterestP } from "react-icons/fa";
import { LuMail } from 'react-icons/lu';
import LogoAnimated from '@/assets/images/brand/tassel-wicker-logo-animated.svg';
import { useToastStore } from '@/store/toastStore';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToastStore();

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            addToast({
                type: 'error',
                title: 'Email Required',
                message: 'Please enter your email address.',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    locale: 'en',
                    fields: [],
                }),
            });

            const result = await response.json();

            if (result.success) {
                addToast({
                    type: 'success',
                    title: 'Subscribed!',
                    message: 'Thank you for subscribing to our newsletter!',
                });
                setEmail('');
            } else {
                console.error('Newsletter subscription error:', result);
                addToast({
                    type: 'error',
                    title: 'Subscription Failed',
                    message: result.error || 'Failed to subscribe. Please try again.',
                });
            }
        } catch (error) {
            console.error('Network error:', error);
            addToast({
                type: 'error',
                title: 'Subscription Failed',
                message: 'Network error. Please check your connection and try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-luxury-black text-luxury-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-6">
                            <div className="w-48 h-auto mb-4">
                                <LogoAnimated className="w-full h-auto text-luxury-white" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1114 111" />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/tasselandwicker/" className="text-luxury-warm-grey hover:text-luxury-white transition-colors duration-200">
                                <FaInstagram size={20} />
                            </a>
                            <a href="https://pin.it/5r2lvE9Ks" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200">
                                <FaPinterestP size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-extralight text-luxury-white mb-6 uppercase">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-luxury-warm-grey hover:text-luxury-white transition-colors duration-200 text-sm font-extralight uppercase">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/corporate-bespoke" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                                    Corporate &amp; Bespoke
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-extralight text-luxury-white mb-6 uppercase">Customer Service</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/shipping" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                                    Returns & Exchanges
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-extralight text-luxury-white mb-6 uppercase">Contact Us</h3>
                        <div className="space-y-4">
                            <a href="mailto:info@tasselandwicker.com" className="flex items-center space-x-3 text-luxury-white hover:text-luxury-white/80 transition-colors duration-200">
                                <LuMail className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-extralight uppercase">info@tasselandwicker.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="border-t border-luxury-warm-grey/20 mt-12 pt-8">
                    <div className="max-w-md mx-auto text-center">
                        <h3 className="text-lg font-extralight text-luxury-white mb-2 uppercase">Join the Tassel & Wicker mailing list</h3>
                        <p className="text-luxury-warm-grey text-sm mb-6 font-extralight uppercase">
                            Subscribe to our newsletter for the latest updates and exclusive offers.
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="flex">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                disabled={isSubmitting}
                                required
                                className="flex-1 px-4 py-3 bg-luxury-charcoal border border-luxury-warm-grey/30 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple text-luxury-white placeholder-luxury-warm-grey font-extralight disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-brand-purple text-luxury-white rounded-r-xl hover:bg-brand-purple-light transition-colors duration-200 font-extralight uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                        <p className="text-luxury-warm-grey text-xs mt-4 font-extralight uppercase">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-luxury-warm-grey/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-luxury-warm-grey text-sm font-extralight uppercase">
                        © 2025 Tassel & Wicker. All rights reserved.
                    </div>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <Link href="/privacy-policy" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-service" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                            Terms of Service
                        </Link>
                        <Link href="/cookie-policy" className="text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-sm font-extralight uppercase">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
