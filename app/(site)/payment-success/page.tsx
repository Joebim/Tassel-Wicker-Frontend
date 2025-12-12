'use client';

// Disable static generation - this page needs to check URL params dynamically
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LuCheck, LuArrowRight, LuShoppingBag } from 'react-icons/lu';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import { usePaymentStore } from '@/store/paymentStore';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();
    const { 
        paymentIntentId, 
        paymentIntentClientSecret, 
        customerEmail: storeCustomerEmail,
        customerName: storeCustomerName,
        setPaymentIntent, 
        clearPaymentIntent 
    } = usePaymentStore();
    const [hasClearedCart, setHasClearedCart] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [paymentIntent, setPaymentIntentState] = useState<string | null>(null);
    const [isStoreHydrated, setIsStoreHydrated] = useState(false);
    const emailSentRef = useRef<string | null>(null); // Track which payment intent has been sent

    // Hydrate Zustand store on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Small delay to ensure Zustand store is hydrated
        const timer = setTimeout(() => {
            setIsStoreHydrated(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    // Initialize payment intent from store or URL (if redirected), then clean up URL
    useEffect(() => {
        if (typeof window === 'undefined' || !isStoreHydrated) return;

        // First check Zustand store
        if (paymentIntentId && !paymentIntent) {
            console.log('[CLIENT] Setting payment intent from store:', paymentIntentId);
            setPaymentIntentState(paymentIntentId);
            return;
        }

        // If not in store, check URL params (for backward compatibility and redirects)
        const urlPaymentIntent = searchParams?.get('payment_intent');
        const urlClientSecret = searchParams?.get('payment_intent_client_secret');

        if (urlPaymentIntent && urlClientSecret && !paymentIntent) {
            console.log('[CLIENT] Setting payment intent from URL:', urlPaymentIntent);
            // Store in Zustand for future use
            setPaymentIntent(urlPaymentIntent, urlClientSecret);
            setPaymentIntentState(urlPaymentIntent);
            
            // Clean up URL params to remove sensitive information
            const url = new URL(window.location.href);
            url.searchParams.delete('payment_intent');
            url.searchParams.delete('payment_intent_client_secret');
            router.replace(url.pathname, { scroll: false });
        }
    }, [searchParams, paymentIntentId, setPaymentIntent, router, paymentIntent, isStoreHydrated]);

    // Get customer email - prefer store, fallback to localStorage
    const getCustomerEmail = () => {
        if (storeCustomerEmail) {
            return storeCustomerEmail;
        }
        if (typeof window !== 'undefined') {
            return localStorage.getItem('checkout_customer_email') || '';
        }
        return '';
    };

    const getCustomerName = () => {
        if (storeCustomerName) {
            return storeCustomerName;
        }
        if (typeof window !== 'undefined') {
            const firstName = localStorage.getItem('checkout_first_name') || '';
            const lastName = localStorage.getItem('checkout_last_name') || '';
            return `${firstName} ${lastName}`.trim();
        }
        return '';
    };

    // Send order confirmation email
    const sendOrderEmail = useCallback(async () => {
        // Prevent duplicate sends - check if we already sent for this payment intent
        if (!paymentIntent) {
            console.log('[CLIENT] Email send skipped: No payment intent');
            return;
        }

        // Check if we already sent email for this payment intent
        const emailSentKey = `email_sent_${paymentIntent}`;
        const alreadySent = emailSentRef.current === paymentIntent || 
                           (typeof window !== 'undefined' && localStorage.getItem(emailSentKey) === 'true');
        
        if (alreadySent || emailSent) {
            console.log('[CLIENT] Email send skipped: Already sent for this payment intent', {
                paymentIntent,
                emailSentRef: emailSentRef.current,
                localStorageCheck: typeof window !== 'undefined' ? localStorage.getItem(emailSentKey) : 'N/A',
                emailSent
            });
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
            // Still clear cart even if no email (payment succeeded)
            if (!hasClearedCart) {
                clearCart();
                setHasClearedCart(true);
            }
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

            // Always clear cart after payment success (whether email succeeds or fails)
            if (!hasClearedCart) {
                clearCart();
                setHasClearedCart(true);
            }

            if (data.success) {
                setEmailSent(true);
                // Mark this payment intent as having email sent
                emailSentRef.current = paymentIntent;
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`email_sent_${paymentIntent}`, 'true');
                }
                console.log('[CLIENT] Order confirmation email sent successfully');
                useToastStore.getState().addToast({
                    type: 'success',
                    title: 'Payment Successful',
                    message: 'Your order has been placed successfully!',
                });
            } else {
                console.error('[CLIENT] Failed to send order confirmation email:', data.error);
                // Email failed but payment succeeded - still show success
                useToastStore.getState().addToast({
                    type: 'success',
                    title: 'Payment Successful',
                    message: 'Your order has been placed successfully!',
                });
            }
        } catch (error) {
            console.error('[CLIENT] Error sending order confirmation email:', error);
            console.error('[CLIENT] Error details:', error instanceof Error ? error.stack : error);
            // Even if email fails, clear cart since payment succeeded
            if (!hasClearedCart) {
                clearCart();
                setHasClearedCart(true);
            }
            // Still show success since payment succeeded
            useToastStore.getState().addToast({
                type: 'success',
                title: 'Payment Successful',
                message: 'Your order has been placed successfully!',
            });
        }
    }, [paymentIntent, emailSent, hasClearedCart, clearCart]);

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    // Send order confirmation email when payment intent is available
    useEffect(() => {
        if (!isStoreHydrated) {
            console.log('[CLIENT] Waiting for store hydration...');
            return;
        }

        if (!paymentIntent || emailSent) {
            console.log('[CLIENT] Email effect skipped:', { 
                hasPaymentIntent: !!paymentIntent, 
                emailSent,
                isStoreHydrated
            });
            return;
        }

        const customerEmail = getCustomerEmail();
        console.log('[CLIENT] Email effect triggered:', { 
            paymentIntent, 
            emailSent, 
            hasCustomerEmail: !!customerEmail,
            customerEmailPrefix: customerEmail ? `${customerEmail.substring(0, 3)}***` : 'none',
            fromStore: !!storeCustomerEmail,
            fromLocalStorage: !!localStorage.getItem('checkout_customer_email')
        });

        if (!customerEmail) {
            console.warn('[CLIENT] No customer email found, cannot send email. Clearing cart anyway.');
            // Still clear cart even without email
            if (!hasClearedCart) {
                clearCart();
                setHasClearedCart(true);
            }
            return;
        }

        console.log('[CLIENT] Setting up email send timer (2 second delay)');
        // Delay to ensure payment is fully processed
        const timer = setTimeout(async () => {
            console.log('[CLIENT] Timer fired, calling sendOrderEmail');
            try {
                await sendOrderEmail();
            } catch (error) {
                console.error('[CLIENT] Error in sendOrderEmail:', error);
            }
            
            // Clean up localStorage and payment store after email is sent (or attempted)
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    console.log('[CLIENT] Cleaning up localStorage and payment store');
                    localStorage.removeItem('checkout_customer_email');
                    localStorage.removeItem('checkout_first_name');
                    localStorage.removeItem('checkout_last_name');
                    clearPaymentIntent(); // Clear payment intent from store after use
                }, 10000); // Keep for 10 seconds in case of retries
            }
        }, 2000); // 2 second delay
        
        return () => {
            console.log('[CLIENT] Cleaning up email timer');
            clearTimeout(timer);
        };
    }, [paymentIntent, emailSent, isStoreHydrated, sendOrderEmail, hasClearedCart, clearCart, clearPaymentIntent, storeCustomerEmail]);

    return (
        <div className="min-h-screen bg-white text-luxury-black flex items-center justify-center py-6 sm:py-12 lg:py-24">
            <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4 sm:space-y-6 lg:space-y-8"
                >
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-brand-purple/10 rounded-full flex items-center justify-center">
                            <LuCheck className="text-brand-purple w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-2xl sm:text-3xl lg:text-5xl font-extralight text-luxury-black mb-2 sm:mb-3 lg:mb-4 uppercase"
                        >
                            Payment Successful
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-luxury-cool-grey font-extralight text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 lg:mb-8 px-2"
                        >
                            Thank you for your purchase! Your order has been confirmed and will be processed shortly.
                        </motion.p>
                    </div>

                    {/* Order Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-white p-4 sm:p-6 lg:p-8"
                    >
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-extralight text-luxury-black mb-3 sm:mb-4 lg:mb-6 uppercase">
                            Next Steps
                        </h2>

                        <div className="space-y-3 sm:space-y-4 text-left">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-purple/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-1">
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1 text-xs sm:text-sm lg:text-base uppercase">Order Confirmation</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-xs sm:text-sm leading-relaxed">
                                        You will receive an email confirmation with your order details shortly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-purple/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-1">
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1 text-xs sm:text-sm lg:text-base uppercase">Processing</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-xs sm:text-sm leading-relaxed">
                                        Please allow 1 - 2 business days for processing before your parcel begins its journey to you. During busy seasons or for custom items, processing may take a little longer.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-purple/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-1">
                                </div>
                                <div>
                                    <h3 className="font-extralight text-luxury-black mb-1 text-xs sm:text-sm lg:text-base uppercase">Shipping</h3>
                                    <p className="text-luxury-cool-grey font-extralight text-xs sm:text-sm leading-relaxed">
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
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                    >
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 sm:gap-3 border border-brand-purple text-brand-purple px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 font-extralight uppercase text-xs sm:text-sm hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200 w-full sm:w-auto"
                        >
                            <LuShoppingBag size={14} className="sm:w-4 sm:h-4" />
                            <span className="text-center">Continue Shopping</span>
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#4c062c] text-luxury-white px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 font-extralight uppercase text-xs sm:text-sm hover:bg-[#4c062c]/90 transition-colors duration-200 w-full sm:w-auto"
                        >
                            <span className="text-center">Return Home</span>
                            <LuArrowRight size={14} className="sm:w-4 sm:h-4" />
                        </Link>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="pt-4 sm:pt-6 lg:pt-8 border-t border-luxury-white/20"
                    >
                        <p className="text-luxury-cool-grey font-extralight text-xs sm:text-sm px-2">
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
            <div className="min-h-screen bg-white text-luxury-black flex items-center justify-center py-6 sm:py-12 lg:py-24">
                <div className="text-center">
                    <p className="text-luxury-cool-grey font-extralight text-sm sm:text-base">Loading...</p>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
