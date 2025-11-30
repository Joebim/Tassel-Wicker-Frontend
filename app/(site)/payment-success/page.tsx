'use client';

// Disable static generation - this page needs to check URL params dynamically
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LuCheck, LuArrowRight, LuShoppingBag } from 'react-icons/lu';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();
    const [hasClearedCart, setHasClearedCart] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const paymentIntent = searchParams?.get('payment_intent');
    const paymentIntentClientSecret = searchParams?.get('payment_intent_client_secret');

    // Get customer email from localStorage (stored during checkout)
    const getCustomerEmail = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('checkout_customer_email') || '';
        }
        return '';
    };

    const getCustomerName = () => {
        if (typeof window !== 'undefined') {
            const firstName = localStorage.getItem('checkout_first_name') || '';
            const lastName = localStorage.getItem('checkout_last_name') || '';
            return `${firstName} ${lastName}`.trim();
        }
        return '';
    };

    // Send order confirmation email
    const sendOrderEmail = useCallback(async () => {
        if (!paymentIntent || emailSent) {
            console.log('[CLIENT] Email send skipped:', { paymentIntent: !!paymentIntent, emailSent });
            return;
        }

        const customerEmail = getCustomerEmail();
        const customerName = getCustomerName();

        console.log('[CLIENT] Attempting to send order email:', {
            paymentIntent,
            customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : 'missing',
            customerName: customerName || 'missing',
        });

        if (!customerEmail) {
            console.warn('[CLIENT] No customer email found in localStorage, skipping email send');
            console.warn('[CLIENT] localStorage keys:', Object.keys(localStorage));
            return;
        }

        try {
            console.log('[CLIENT] Sending POST request to /api/send-order-email');
            const response = await fetch('/api/send-order-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId: paymentIntent,
                    customerEmail: customerEmail,
                    customerName: customerName,
                }),
            });

            console.log('[CLIENT] Response status:', response.status);
            const data = await response.json();
            console.log('[CLIENT] Response data:', data);

            if (data.success) {
                setEmailSent(true);
                console.log('[CLIENT] Order confirmation email sent successfully');
            } else {
                console.error('[CLIENT] Failed to send order confirmation email:', data.error);
            }
        } catch (error) {
            console.error('[CLIENT] Error sending order confirmation email:', error);
            console.error('[CLIENT] Error details:', error instanceof Error ? error.stack : error);
        }
    }, [paymentIntent, emailSent]);

    // Clear cart and show success message when payment is confirmed
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);

            // Clear cart on successful payment (only once)
            // Check if we have payment intent parameters (Stripe redirects with these)
            // or if we're on the success page (fallback for non-redirect payments)
            if (!hasClearedCart && (paymentIntent || paymentIntentClientSecret || window.location.pathname === '/payment-success')) {
                clearCart();
                // Use setTimeout to avoid synchronous setState in effect
                const timer = setTimeout(() => {
                    setHasClearedCart(true);
                    useToastStore.getState().addToast({
                        type: 'success',
                        title: 'Payment Successful',
                        message: 'Your order has been placed successfully!',
                    });
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [paymentIntent, paymentIntentClientSecret, clearCart, hasClearedCart]);

    // Send order confirmation email when payment intent is available
    useEffect(() => {
        console.log('[CLIENT] Email effect triggered:', { paymentIntent, emailSent });

        if (paymentIntent && !emailSent) {
            console.log('[CLIENT] Setting up email send timer (1 second delay)');
            // Delay slightly to ensure payment is fully processed
            const timer = setTimeout(async () => {
                console.log('[CLIENT] Timer fired, calling sendOrderEmail');
                await sendOrderEmail();
                // Clean up localStorage after email is sent (or attempted)
                if (typeof window !== 'undefined') {
                    setTimeout(() => {
                        console.log('[CLIENT] Cleaning up localStorage');
                        localStorage.removeItem('checkout_customer_email');
                        localStorage.removeItem('checkout_first_name');
                        localStorage.removeItem('checkout_last_name');
                    }, 5000); // Keep for 5 seconds in case of retries
                }
            }, 1000);
            return () => {
                console.log('[CLIENT] Cleaning up email timer');
                clearTimeout(timer);
            };
        } else {
            console.log('[CLIENT] Email effect conditions not met:', {
                hasPaymentIntent: !!paymentIntent,
                emailSent,
            });
        }
    }, [paymentIntent, emailSent, sendOrderEmail]);

    return (
        <div className="min-h-screen bg-white text-luxury-black flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-brand-purple/10 rounded-full flex items-center justify-center">
                            <LuCheck className="text-brand-purple" size={48} />
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
                        className="bg-white p-8"
                    >
                        <h2 className="text-2xl font-extralight text-luxury-black mb-6 uppercase">
                            Next Steps
                        </h2>

                        <div className="space-y-4 text-left">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1 uppercase">Order Confirmation</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        You will receive an email confirmation with your order details shortly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1 uppercase">Processing</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        Please allow 1 - 2 business days for processing before your parcel begins its journey to you. During busy seasons or for custom items, processing may take a little longer.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1 uppercase">Shipping</h3>
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
                            className="inline-flex items-center gap-3 bg-[#4c062c] text-luxury-white px-8 py-3 font-extralight uppercase hover:bg-[#4c062c]/90 transition-colors duration-200"
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
                        className="pt-8 border-t border-luxury-white/20"
                    >
                        <p className="text-luxury-cool-grey font-extralight text-sm">
                            Contact us at{' '}
                            <a
                                href="mailto:info@tasselandwicker.com"
                                className="text-brand-purple hover:text-brand-purple-light transition-colors"
                            >
                                info@tasselandwicker.com
                            </a>
                            {' '}if you have any questions about your order.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white text-luxury-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-luxury-cool-grey font-extralight">Loading...</p>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
