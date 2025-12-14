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
    console.log('[PAYMENT-SUCCESS] ========== COMPONENT RENDERED ==========');
    console.log('[PAYMENT-SUCCESS] Component render time:', new Date().toISOString());
    
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
    const [isProcessingEmail, setIsProcessingEmail] = useState(false);
    const emailSendAttemptedRef = useRef<string | null>(null); // Track which payment intent we've attempted to send email for

    // Check if email was already sent for this payment intent (using sessionStorage to prevent duplicates)
    const checkEmailSent = (paymentIntentId: string): boolean => {
        if (typeof window === 'undefined') return false;
        const sentEmails = sessionStorage.getItem('sent_order_emails');
        if (sentEmails) {
            try {
                const sentList = JSON.parse(sentEmails);
                return sentList.includes(paymentIntentId);
            } catch {
                return false;
            }
        }
        return false;
    };

    // Mark email as sent for this payment intent
    const markEmailSent = (paymentIntentId: string): void => {
        if (typeof window === 'undefined') return;
        const sentEmails = sessionStorage.getItem('sent_order_emails');
        let sentList: string[] = [];
        if (sentEmails) {
            try {
                sentList = JSON.parse(sentEmails);
            } catch {
                sentList = [];
            }
        }
        if (!sentList.includes(paymentIntentId)) {
            sentList.push(paymentIntentId);
            sessionStorage.setItem('sent_order_emails', JSON.stringify(sentList));
        }
    };

    // Check if payment store is hydrated
    const { isHydrated: paymentStoreHydrated } = usePaymentStore();

    // Wait for payment store to be hydrated
    useEffect(() => {
        if (typeof window === 'undefined') {
            console.log('[PAYMENT-SUCCESS] Server-side render, skipping store hydration check');
            return;
        }
        
        console.log('[PAYMENT-SUCCESS] ========== CHECKING STORE HYDRATION ==========');
        console.log('[PAYMENT-SUCCESS] Payment store hydrated:', paymentStoreHydrated);
        
        // Check if store is already hydrated
        if (paymentStoreHydrated) {
            console.log('[PAYMENT-SUCCESS] ✅ Payment store is already hydrated');
            setIsStoreHydrated(true);
            return;
        }
        
        // If not hydrated, wait and check again
        console.log('[PAYMENT-SUCCESS] Waiting for payment store to hydrate...');
        const checkInterval = setInterval(() => {
            const hydrated = usePaymentStore.getState().isHydrated;
            console.log('[PAYMENT-SUCCESS] Checking hydration status:', hydrated);
            if (hydrated) {
                console.log('[PAYMENT-SUCCESS] ✅ Payment store hydrated!');
                setIsStoreHydrated(true);
                clearInterval(checkInterval);
            }
        }, 100);

        // Timeout after 2 seconds to prevent infinite waiting
        const timeout = setTimeout(() => {
            console.warn('[PAYMENT-SUCCESS] ⚠️ Payment store hydration timeout, proceeding anyway');
            setIsStoreHydrated(true);
            clearInterval(checkInterval);
        }, 2000);
        
        return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            console.log('[PAYMENT-SUCCESS] Store hydration check cleaned up');
        };
    }, [paymentStoreHydrated]);

    // Initialize payment intent from store or URL (if redirected), then clean up URL
    useEffect(() => {
        if (typeof window === 'undefined' || !isStoreHydrated) return;

        console.log('[CLIENT] ========== PAYMENT SUCCESS PAGE INITIALIZATION ==========');
        console.log('[CLIENT] Store state:', {
            paymentIntentId: paymentIntentId || 'none',
            storeCustomerEmail: storeCustomerEmail || 'none',
            storeCustomerName: storeCustomerName || 'none',
            isStoreHydrated,
        });

        // First check Zustand store
        if (paymentIntentId && !paymentIntent) {
            console.log('[CLIENT] ✅ Found payment intent in store:', paymentIntentId);
            console.log('[CLIENT] Checking if email already sent for this payment intent...');
            const alreadySent = checkEmailSent(paymentIntentId);
            if (alreadySent) {
                console.log('[CLIENT] ⚠️ Email already sent for this payment intent, skipping');
                setEmailSent(true);
            }
            setPaymentIntentState(paymentIntentId);
            return;
        }

        // If not in store, check URL params (for backward compatibility and redirects)
        const urlPaymentIntent = searchParams?.get('payment_intent');
        const urlClientSecret = searchParams?.get('payment_intent_client_secret');

        if (urlPaymentIntent && urlClientSecret && !paymentIntent) {
            console.log('[CLIENT] ⚠️ Found payment intent in URL (should not happen):', urlPaymentIntent);
            console.log('[CLIENT] Checking if email already sent for this payment intent...');
            const alreadySent = checkEmailSent(urlPaymentIntent);
            if (alreadySent) {
                console.log('[CLIENT] ⚠️ Email already sent for this payment intent, skipping');
                setEmailSent(true);
            }
            
            // Store in Zustand for future use
            setPaymentIntent(urlPaymentIntent, urlClientSecret);
            setPaymentIntentState(urlPaymentIntent);
            
            // IMMEDIATELY clean up URL params to remove sensitive information
            console.log('[CLIENT] Cleaning up URL params immediately...');
            const url = new URL(window.location.href);
            url.searchParams.delete('payment_intent');
            url.searchParams.delete('payment_intent_client_secret');
            router.replace(url.pathname, { scroll: false });
            console.log('[CLIENT] ✅ URL params cleaned up');
        }
    }, [searchParams, paymentIntentId, setPaymentIntent, router, paymentIntent, isStoreHydrated, storeCustomerEmail, storeCustomerName]);

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
        if (!paymentIntent) {
            console.log('[CLIENT] No payment intent, skipping email send');
            return;
        }

        console.log('[CLIENT] ========== SEND ORDER EMAIL CALLED ==========');
        console.log('[CLIENT] Current state:', {
            paymentIntent,
            emailSent,
            isProcessingEmail,
            hasClearedCart,
            emailSendAttempted: emailSendAttemptedRef.current,
        });

        // CRITICAL: Check sessionStorage FIRST to prevent duplicates (before any state checks)
        if (checkEmailSent(paymentIntent)) {
            console.log('[CLIENT] ⚠️ Email already sent for payment intent (sessionStorage check):', paymentIntent);
            console.log('[CLIENT] Skipping email send to prevent duplicate');
            setEmailSent(true);
            return;
        }

        // Check ref to see if we're currently processing this payment intent
        if (emailSendAttemptedRef.current === paymentIntent) {
            console.log('[CLIENT] ⚠️ Email send already in progress for this payment intent (ref check):', paymentIntent);
            console.log('[CLIENT] Skipping email send to prevent duplicate');
            return;
        }

        if (emailSent || isProcessingEmail) {
            console.log('[CLIENT] Email send skipped (state check):', { 
                emailSent,
                isProcessingEmail,
            });
            return;
        }

        // Mark as processing IMMEDIATELY to prevent race conditions (but don't mark as sent yet)
        emailSendAttemptedRef.current = paymentIntent;
        setIsProcessingEmail(true);

        const customerEmail = getCustomerEmail();
        const customerName = getCustomerName();

        console.log('[CLIENT] ========== PREPARING TO SEND EMAIL ==========');
        console.log('[CLIENT] Email Details:', {
            paymentIntent,
            customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : 'missing',
            customerEmailFull: customerEmail || 'missing',
            customerName: customerName || 'missing',
            fromStore: !!storeCustomerEmail,
            fromLocalStorage: !!localStorage.getItem('checkout_customer_email'),
        });

        if (!customerEmail) {
            console.error('[CLIENT] ❌ No customer email found, cannot send email');
            console.error('[CLIENT] localStorage keys:', Object.keys(localStorage));
            console.error('[CLIENT] Store customer email:', storeCustomerEmail || 'none');
            // Still clear cart even if no email (payment succeeded)
            if (!hasClearedCart) {
                clearCart();
                setHasClearedCart(true);
            }
            return;
        }

        try {
            console.log('[CLIENT] ========== SENDING EMAIL REQUEST ==========');
            console.log('[CLIENT] Request payload:', {
                paymentIntentId: paymentIntent,
                customerEmail: customerEmail,
                customerName: customerName,
            });
            console.log('[CLIENT] Making POST request to /api/send-order-email...');
            
            const requestStartTime = Date.now();
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

            const requestDuration = Date.now() - requestStartTime;
            console.log('[CLIENT] ========== EMAIL REQUEST RESPONSE ==========');
            console.log('[CLIENT] Response received:', {
                status: response.status,
                statusText: response.statusText,
                duration: `${requestDuration}ms`,
                headers: Object.fromEntries(response.headers.entries()),
            });

            const data = await response.json();
            console.log('[CLIENT] Response data:', {
                success: data.success,
                message: data.message,
                orderId: data.orderId,
                orderEmailMessageId: data.orderEmailMessageId || 'none',
                paymentEmailMessageId: data.paymentEmailMessageId || 'none',
                error: data.error || 'none',
            });

            // Cart is already cleared by the separate useEffect when payment intent is confirmed
            // This ensures cart is cleared even if email sending fails
            console.log('[CLIENT] Email request completed, cart clearing handled separately');

            if (data.success) {
                // Mark as sent in sessionStorage ONLY after successful send
                markEmailSent(paymentIntent);
                setEmailSent(true);
                console.log('[CLIENT] ✅✅✅ EMAIL SENT SUCCESSFULLY ✅✅✅');
                console.log('[CLIENT] Order Email Message ID:', data.orderEmailMessageId);
                console.log('[CLIENT] Payment Email Message ID:', data.paymentEmailMessageId);
                console.log('[CLIENT] Marked email as sent in sessionStorage for payment intent:', paymentIntent);
                useToastStore.getState().addToast({
                    type: 'success',
                    title: 'Payment Successful',
                    message: 'Your order has been placed successfully!',
                });
            } else {
                console.error('[CLIENT] ❌ FAILED TO SEND EMAIL:', data.error);
                // Email failed but payment succeeded - still show success
                useToastStore.getState().addToast({
                    type: 'success',
                    title: 'Payment Successful',
                    message: 'Your order has been placed successfully!',
                });
            }
        } catch (error) {
            console.error('[CLIENT] ========== EMAIL SEND ERROR ==========');
            console.error('[CLIENT] Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('[CLIENT] Error message:', error instanceof Error ? error.message : String(error));
            console.error('[CLIENT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            // Cart is already cleared by the separate useEffect when payment intent is confirmed
            console.log('[CLIENT] Email failed, but cart clearing handled separately');
            // Still show success since payment succeeded
            useToastStore.getState().addToast({
                type: 'success',
                title: 'Payment Successful',
                message: 'Your order has been placed successfully!',
            });
        } catch (error) {
            console.error('[CLIENT] ========== EMAIL SEND ERROR ==========');
            console.error('[CLIENT] Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('[CLIENT] Error message:', error instanceof Error ? error.message : String(error));
            console.error('[CLIENT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            // Cart is already cleared by the separate useEffect when payment intent is confirmed
            console.log('[CLIENT] Email failed, but cart clearing handled separately');
            // Still show success since payment succeeded
            useToastStore.getState().addToast({
                type: 'success',
                title: 'Payment Successful',
                message: 'Your order has been placed successfully!',
            });
        } finally {
            setIsProcessingEmail(false);
            // Don't clear the ref - keep it set to prevent duplicate sends
            // The sessionStorage check will prevent duplicates on page refresh
        }
    }, [paymentIntent, emailSent, hasClearedCart, clearCart, isProcessingEmail, storeCustomerEmail]);

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('[PAYMENT-SUCCESS] Scrolling to top of page');
            window.scrollTo(0, 0);
        }
    }, []);

    // Clear cart immediately when payment intent is confirmed (payment succeeded)
    useEffect(() => {
        if (!isStoreHydrated || !paymentIntent) {
            console.log('[CLIENT] Cart clearing check skipped:', {
                isStoreHydrated,
                hasPaymentIntent: !!paymentIntent,
            });
            return;
        }

        console.log('[CLIENT] ========== CART CLEARING CHECK ==========');
        console.log('[CLIENT] Payment intent confirmed, ensuring cart is cleared...');
        console.log('[CLIENT] Cart state before clear:', {
            hasClearedCart,
            cartItemsCount: useCartStore.getState().items.length,
        });
        
        // Always clear cart when payment intent is present (payment succeeded)
        if (!hasClearedCart) {
            console.log('[CLIENT] Clearing cart immediately (payment succeeded)...');
            clearCart();
            setHasClearedCart(true);
            const cartState = useCartStore.getState();
            console.log('[CLIENT] ✅ Cart cleared:', {
                itemsCount: cartState.items.length,
                totalItems: cartState.getTotalItems(),
            });
        } else {
            console.log('[CLIENT] Cart already cleared (hasClearedCart = true)');
        }
    }, [paymentIntent, isStoreHydrated, hasClearedCart, clearCart]);

    // Send order confirmation email when payment intent is available
    useEffect(() => {
        console.log('[CLIENT] ========== EMAIL EFFECT TRIGGERED ==========');
        console.log('[CLIENT] Effect dependencies:', {
            isStoreHydrated,
            paymentIntent: paymentIntent || 'none',
            emailSent,
            isProcessingEmail,
        });

        if (!isStoreHydrated) {
            console.log('[CLIENT] ⏳ Waiting for store hydration...');
            return;
        }

        if (!paymentIntent) {
            console.log('[CLIENT] ⏸️ No payment intent available yet');
            return;
        }

        // CRITICAL: Check sessionStorage FIRST before doing anything else
        if (checkEmailSent(paymentIntent)) {
            console.log('[CLIENT] ✅ Email already sent for this payment intent (sessionStorage check)');
            setEmailSent(true);
            return;
        }

        if (emailSent || isProcessingEmail) {
            console.log('[CLIENT] ⏸️ Email already sent or currently processing:', {
                emailSent,
                isProcessingEmail,
            });
            return;
        }

        // Check ref to see if we're already processing
        if (emailSendAttemptedRef.current === paymentIntent) {
            console.log('[CLIENT] ⚠️ Email send already in progress for this payment intent (ref check)');
            return;
        }

        const customerEmail = getCustomerEmail();
        console.log('[CLIENT] ========== EMAIL EFFECT - READY TO SEND ==========');
        console.log('[CLIENT] Email Details:', { 
            paymentIntent, 
            emailSent, 
            isProcessingEmail,
            hasCustomerEmail: !!customerEmail,
            customerEmailPrefix: customerEmail ? `${customerEmail.substring(0, 3)}***` : 'none',
            customerEmailFull: customerEmail || 'none',
            fromStore: !!storeCustomerEmail,
            fromLocalStorage: !!localStorage.getItem('checkout_customer_email'),
            sessionStorageCheck: checkEmailSent(paymentIntent),
            emailSendAttempted: emailSendAttemptedRef.current,
        });

        if (!customerEmail) {
            console.error('[CLIENT] ❌ No customer email found, cannot send email');
            console.error('[CLIENT] Clearing cart anyway since payment succeeded');
            // Still clear cart even without email
            if (!hasClearedCart) {
                clearCart();
                setHasClearedCart(true);
            }
            return;
        }

        console.log('[CLIENT] ⏱️ Setting up email send timer (2 second delay)...');
        // Delay to ensure payment is fully processed
        const timer = setTimeout(async () => {
            console.log('[CLIENT] ⏰ Timer fired, calling sendOrderEmail');
            try {
                await sendOrderEmail();
            } catch (error) {
                console.error('[CLIENT] ❌ Error in sendOrderEmail:', error);
            }
            
            // Clean up localStorage and payment store after email is sent (or attempted)
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    console.log('[CLIENT] 🧹 Cleaning up localStorage and payment store');
                    localStorage.removeItem('checkout_customer_email');
                    localStorage.removeItem('checkout_first_name');
                    localStorage.removeItem('checkout_last_name');
                    clearPaymentIntent(); // Clear payment intent from store after use
                    console.log('[CLIENT] ✅ Cleanup complete');
                }, 10000); // Keep for 10 seconds in case of retries
            }
        }, 2000); // 2 second delay
        
        return () => {
            console.log('[CLIENT] 🧹 Cleaning up email timer');
            clearTimeout(timer);
        };
    }, [paymentIntent, emailSent, isStoreHydrated, sendOrderEmail, hasClearedCart, clearCart, clearPaymentIntent, storeCustomerEmail, isProcessingEmail]);

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
