'use client';

// Disable static generation - this page needs to check URL params dynamically
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LuCheck, LuArrowRight, LuShoppingBag } from 'react-icons/lu';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';

export default function PaymentSuccess() {
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();
    const [hasClearedCart, setHasClearedCart] = useState(false);
    
    const paymentIntent = searchParams?.get('payment_intent');
    const paymentIntentClientSecret = searchParams?.get('payment_intent_client_secret');

    // Clear cart and show success message when payment is confirmed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
            
            // Clear cart on successful payment (only once)
            // Check if we have payment intent parameters (Stripe redirects with these)
            // or if we're on the success page (fallback for non-redirect payments)
            if (!hasClearedCart && (paymentIntent || paymentIntentClientSecret || window.location.pathname === '/payment-success')) {
                clearCart();
                setHasClearedCart(true);
                useToastStore.getState().addToast({
                    type: 'success',
                    title: 'Payment Successful',
                    message: 'Your order has been placed successfully!',
                });
            }
        }
    }, [paymentIntent, paymentIntentClientSecret, clearCart, hasClearedCart]);

    return (
        <div className="min-h-screen bg-luxury-white text-luxury-black flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center">
                            <LuCheck className="text-brand-green" size={48} />
                        </div>
                    </div>

                    {/* Success Message */}
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-5xl font-extralight text-luxury-black mb-4 uppercase"
                        >
                            Payment Successful
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-luxury-cool-grey font-extralight text-lg mb-8"
                        >
                            Thank you for your purchase! Your order has been confirmed and will be processed shortly.
                        </motion.p>
                    </div>

                    {/* Order Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-luxury-cream-light p-8"
                    >
                        <h2 className="text-2xl font-extralight text-luxury-black mb-6 uppercase">
                            What's Next?
                        </h2>

                        <div className="space-y-4 text-left">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-brand-purple font-extralight text-sm">1</span>
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1">Order Confirmation</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        You'll receive an email confirmation with your order details within the next few minutes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-brand-purple font-extralight text-sm">2</span>
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1">Processing</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        Our team will carefully prepare your luxury basket with attention to every detail.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-brand-purple font-extralight text-sm">3</span>
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1">Shipping</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        Your order will be shipped within 2-3 business days with tracking information provided.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-3 border border-brand-purple text-brand-purple px-8 py-3 font-extralight uppercase hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
                        >
                            <LuShoppingBag size={16} />
                            <span>Continue Shopping</span>
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 bg-luxury-black text-luxury-white px-8 py-3 font-extralight uppercase hover:bg-luxury-charcoal transition-colors duration-200"
                        >
                            <span>Return Home</span>
                            <LuArrowRight size={16} />
                        </Link>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="pt-8 border-t border-luxury-cream-light"
                    >
                        <p className="text-luxury-cool-grey font-extralight text-sm">
                            Questions about your order? Contact us at{' '}
                            <a
                                href="mailto:support@tasselwicker.com"
                                className="text-brand-purple hover:text-brand-purple-light transition-colors"
                            >
                                support@tasselwicker.com
                            </a>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
