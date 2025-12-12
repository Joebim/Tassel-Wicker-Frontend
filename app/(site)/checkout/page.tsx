'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { LuArrowLeft } from 'react-icons/lu';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { usePaymentStore } from '@/store/paymentStore';
import { usePrice, usePriceFormat } from '@/hooks/usePrice';
import { useCurrencyStore } from '@/store/currencyStore';
import CheckoutOptions from '@/components/checkout/CheckoutOptions';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Stripe shipping rate IDs
const STRIPE_SHIPPING_RATES = [
    'shr_1SY6XKDqrk2AVTntaI2Qcu4V', // International delivery within Europe (DHL)
    'shr_1SY6VyDqrk2AVTnto4PrPyL3', // International delivery outside Europe (DHL)
    'shr_1SY658Dqrk2AVTnt4LEtyBhH', // Standard shipping incl VAT (DHL)
];

// Component for displaying item price
const CheckoutItemPrice: React.FC<{ price: number; quantity: number }> = ({ price, quantity }) => {
    const itemTotal = price * quantity;
    const { formattedPrice } = usePrice(itemTotal);
    return <p className="font-extralight">{formattedPrice}</p>;
};

// Payment Form Component (uses Stripe Elements)
const PaymentForm: React.FC<{
    userEmail: string;
    userName: string;
    isGuest?: boolean;
    onSuccess: () => void;
    onError: (error: string) => void;
    totalPrice: number;
    clientSecret: string;
    paymentIntentId: string;
    onShippingChange: (shippingCost: number, shippingCostGBP: number) => void;
    currency: string;
    exchangeRate: number | null;
}> = ({ userEmail, userName, isGuest = false, onSuccess, onError, totalPrice, clientSecret, paymentIntentId, onShippingChange, currency, exchangeRate }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedShippingRate, setSelectedShippingRate] = useState<string | null>(null);
    const [shippingCostGBP, setShippingCostGBP] = useState<number>(0);
    const [shippingRates, setShippingRates] = useState<Array<{ id: string; amount: number; currency: string; displayName: string }>>([]);
    const [addressComplete, setAddressComplete] = useState(false);
    const [guestEmail, setGuestEmail] = useState<string>('');
    // Use guest email if guest checkout, otherwise use user email
    const emailToUse = isGuest ? guestEmail : userEmail;
    // totalPrice is in GBP, shippingCostGBP is in GBP, so use usePrice to convert the sum
    const { formattedPrice } = usePrice(totalPrice + shippingCostGBP);

    // Use exchangeRate from props (passed from parent)

    // Fetch shipping rates from Stripe
    useEffect(() => {
        const fetchShippingRates = async () => {
            try {
                const rates = await Promise.all(
                    STRIPE_SHIPPING_RATES.map(async (rateId) => {
                        const response = await fetch('/api/get-shipping-rate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rateId }),
                        });
                        const data = await response.json();
                        return { id: rateId, amount: data.amount || 0, currency: data.currency || 'gbp', displayName: data.displayName || 'Shipping' };
                    })
                );
                setShippingRates(rates);
            } catch (err) {
                console.error('Error fetching shipping rates:', err);
            }
        };
        fetchShippingRates();
    }, []);

    // Listen to shipping address changes using AddressElement
    useEffect(() => {
        if (!elements) return;

        // AddressElement is accessed differently - we need to use the onChange prop
        // For now, we'll show shipping options immediately
        setAddressComplete(true);
    }, [elements]);

    // Update PaymentIntent when shipping rate is selected
    const handleShippingRateChange = async (rateId: string) => {
        setSelectedShippingRate(rateId);

        const rate = shippingRates.find(r => r.id === rateId);
        if (rate && rate.amount) {
            // Shipping amount from Stripe is in GBP (cents)
            const shippingAmountGBP = rate.amount / 100;

            // Convert shipping to customer currency if needed
            let shippingAmount = shippingAmountGBP;
            if (currency !== 'GBP' && exchangeRate) {
                // Convert GBP shipping to customer currency
                shippingAmount = shippingAmountGBP / exchangeRate;
            }

            setShippingCostGBP(shippingAmountGBP);
            // Pass both converted amount and GBP amount to parent
            onShippingChange(shippingAmount, shippingAmountGBP);

            // Calculate total amount in customer currency
            let totalAmount = totalPrice + shippingAmount;
            if (currency !== 'GBP' && exchangeRate) {
                // totalPrice is already in customer currency, shippingAmount is now in customer currency
                // So total is correct
            } else {
                // Both are in GBP
                totalAmount = totalPrice + shippingAmountGBP;
            }

            // Update PaymentIntent amount
            try {
                await fetch('/api/update-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId,
                        amount: totalAmount,
                        currency: currency.toLowerCase(),
                    }),
                });
            } catch (err) {
                console.error('Error updating payment intent:', err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || 'Please check your payment details');
                setIsProcessing(false);
                return;
            }

            // Validate guest email if guest checkout
            if (isGuest && !guestEmail) {
                setError('Please enter your email address');
                setIsProcessing(false);
                return;
            }

            if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
                setError('Please enter a valid email address');
                setIsProcessing(false);
                return;
            }

            // Store customer info in localStorage for email sending on success page
            if (typeof window !== 'undefined') {
                localStorage.setItem('checkout_customer_email', emailToUse);
                const nameParts = userName.split(' ');
                localStorage.setItem('checkout_first_name', nameParts[0] || '');
                localStorage.setItem('checkout_last_name', nameParts.slice(1).join(' ') || '');
            }

            // Store payment intent and customer info BEFORE confirming payment
            // This ensures data is available even if Stripe redirects
            const paymentIntentIdFromSecret = clientSecret.split('_secret_')[0];
            if (paymentIntentIdFromSecret) {
                usePaymentStore.getState().setPaymentIntent(paymentIntentIdFromSecret, clientSecret);
                usePaymentStore.getState().setCustomerInfo(emailToUse, userName);
                console.log('[CHECKOUT] Stored payment intent and customer info before payment confirmation:', {
                    paymentIntentId: paymentIntentIdFromSecret.substring(0, 10) + '...',
                    customerEmail: emailToUse.substring(0, 3) + '***',
                });
            }

            // Confirm payment with existing clientSecret
            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                    receipt_email: emailToUse,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                setError(confirmError.message || 'Payment failed. Please try again.');
                setIsProcessing(false);
            } else {
                const result = await stripe.retrievePaymentIntent(clientSecret);

                if (result.paymentIntent?.status === 'succeeded') {
                    const paymentIntentId = result.paymentIntent.id;
                    console.log('[CHECKOUT] Payment succeeded without redirect, payment intent:', paymentIntentId);

                    // Store payment intent and customer info in Zustand store (not in URL for security)
                    usePaymentStore.getState().setPaymentIntent(paymentIntentId, clientSecret);
                    usePaymentStore.getState().setCustomerInfo(emailToUse, userName);

                    // Email will be sent from payment-success page to avoid duplicates
                    // Redirect without sensitive information in URL
                    // Cart will be cleared on payment-success page after email is sent
                    window.location.href = `/payment-success`;
                } else {
                    onSuccess();
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            onError(errorMessage);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Email Field */}
            {isGuest && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-extralight text-luxury-black mb-4 uppercase">
                        Email Address
                    </h3>
                    <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full px-4 py-3 border border-luxury-warm-grey/20 rounded-lg bg-white focus:outline-none focus:border-brand-purple/50 transition-colors duration-200 font-extralight text-luxury-black placeholder-luxury-cool-grey"
                    />
                    <p className="text-xs text-luxury-cool-grey font-extralight mt-2">
                        We'll send your order confirmation to this email address
                    </p>
                </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-extralight text-luxury-black mb-4 uppercase">
                    Shipping Address
                </h3>
                <AddressElement
                    options={{
                        mode: 'shipping',
                        // No allowedCountries restriction - all countries are allowed
                        blockPoBox: false,
                    }}
                />
            </div>

            {/* Shipping Options */}
            {addressComplete && shippingRates.length > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-extralight text-luxury-black mb-4 uppercase">
                        Shipping Method
                    </h3>
                    <div className="space-y-3">
                        {shippingRates.map((rate) => {
                            const ratePrice = rate.amount ? rate.amount / 100 : 0;
                            const ShippingRatePrice: React.FC<{ price: number }> = ({ price }) => {
                                const { formattedPrice } = usePrice(price);
                                return <p className="font-extralight text-luxury-black">{formattedPrice}</p>;
                            };
                            return (
                                <label
                                    key={rate.id}
                                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedShippingRate === rate.id
                                        ? 'border-brand-purple bg-purple-50'
                                        : 'border-luxury-cool-grey hover:border-brand-purple/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value={rate.id}
                                            checked={selectedShippingRate === rate.id}
                                            onChange={(e) => handleShippingRateChange(e.target.value)}
                                            className="w-4 h-4 text-brand-purple focus:ring-brand-purple"
                                        />
                                        <div>
                                            <p className="font-extralight text-luxury-black">{rate.displayName || 'Shipping Option'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <ShippingRatePrice price={ratePrice} />
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-extralight text-luxury-black mb-4 uppercase">
                    Payment Information
                </h3>
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        wallets: {
                            applePay: 'auto',
                            googlePay: 'auto',
                        },
                        business: {
                            name: 'Tassel & Wicker',
                        },
                        terms: {
                            card: 'always',
                        },
                        fields: {
                            billingDetails: {
                                name: 'auto',
                                email: 'auto',
                                phone: 'auto',
                                address: {
                                    country: 'auto',
                                    line1: 'auto',
                                    line2: 'auto',
                                    city: 'auto',
                                    state: 'auto',
                                    postalCode: 'auto',
                                },
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm font-extralight bg-red-50 p-4 rounded-lg"
                >
                    {error}
                </motion.div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-4 px-6 bg-brand-purple text-luxury-white font-extralight uppercase hover:bg-brand-purple-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {isProcessing ? 'Processing Payment...' : `Complete Order - ${formattedPrice}`}
            </button>
        </form>
    );
};

export default function Checkout() {
    const router = useRouter();
    const { items, getTotalPrice } = useCartStore();
    const { user, hasHydrated } = useAuthStore();
    const {
        location,
        currency,
        fxQuote,
        isLocationDetected,
        detectLocation,
        fetchFXQuote
    } = useCurrencyStore();
    const baseTotalPrice = getTotalPrice();
    const { formattedPrice: formattedTotal } = usePrice(baseTotalPrice);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [shippingCostGBP, setShippingCostGBP] = useState<number>(0);
    // shippingCost is already in customer currency, so use usePriceFormat to avoid double conversion
    const { formattedPrice: shippingFormatted } = usePriceFormat(shippingCost);
    // For total, we need to add GBP amounts and let usePrice convert
    const { formattedPrice: totalFormatted } = usePrice(baseTotalPrice + shippingCostGBP);
    const [isLoadingFXQuote, setIsLoadingFXQuote] = useState(false);
    const [checkoutOption, setCheckoutOption] = useState<'signin' | 'guest' | null>(null);
    const exchangeRate = useCurrencyStore((state) => state.getExchangeRate(currency));

    // User data comes from authStore - no need for formData state

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            router.push('/cart');
        }
    }, [items.length, router]);

    // Auto-select checkout option for logged-in users
    useEffect(() => {
        if (hasHydrated && user && !checkoutOption) {
            // Automatically proceed to checkout if user is logged in
            setCheckoutOption('signin');
        }
    }, [hasHydrated, user, checkoutOption]);

    // Handle checkout option selection
    const handleCheckoutOptionSelect = (option: 'signin' | 'guest') => {
        setCheckoutOption(option);
        if (option === 'signin' && !user) {
            useToastStore.getState().addToast({
                type: 'info',
                title: 'Sign In Required',
                message: 'Please sign in to your account to continue with checkout.',
            });
            router.push('/login?redirect=/checkout');
        }
    };

    // Detect location and fetch FX quote on mount
    useEffect(() => {
        const initializeCurrency = async () => {
            if (!isLocationDetected) {
                await detectLocation();
            }

            // Fetch FX quote if currency is not GBP
            if (location && location.currency !== 'GBP' && !fxQuote) {
                setIsLoadingFXQuote(true);
                try {
                    await fetchFXQuote(location.currency);
                } catch (error) {
                    console.error('Error fetching FX quote:', error);
                } finally {
                    setIsLoadingFXQuote(false);
                }
            }
        };

        if (hasHydrated) {
            initializeCurrency();
        }
    }, [hasHydrated, isLocationDetected, location, fxQuote, detectLocation, fetchFXQuote]);

    // Create payment intent with FX quote if available
    useEffect(() => {
        if (items.length > 0 && baseTotalPrice > 0 && !isLoadingFXQuote) {
            const createPaymentIntent = async () => {
                try {
                    // Calculate amount in customer's currency if FX quote is available
                    let finalAmount = baseTotalPrice;
                    let finalCurrency = 'gbp';
                    let fxQuoteIdToUse: string | null = null;

                    // Use FX quote for price conversion (both 'active' and 'none' statuses)
                    // Note: FX quotes with lock_duration='none' cannot be used in PaymentIntents
                    if (fxQuote && (fxQuote.lockStatus === 'active' || fxQuote.lockStatus === 'none') && currency !== 'GBP') {
                        const exchangeRate = fxQuote.rates[currency.toLowerCase()]?.exchange_rate;
                        const lockDuration = fxQuote.lockDuration;

                        if (exchangeRate) {
                            // Convert GBP amount to customer currency
                            // exchange_rate converts FROM customer currency TO GBP
                            // So to get customer amount: GBP amount / exchange_rate
                            finalAmount = baseTotalPrice / exchangeRate;
                            finalCurrency = currency.toLowerCase();

                            // Only use FX quote ID in PaymentIntent if it has a locked duration (not 'none')
                            if (lockDuration && lockDuration !== 'none') {
                                fxQuoteIdToUse = fxQuote.id;
                            }
                            // For lock_duration='none', don't set fxQuoteIdToUse - Stripe will handle conversion
                        }
                    }

                    const response = await fetch('/api/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: finalAmount,
                            currency: finalCurrency,
                            fxQuoteId: fxQuoteIdToUse, // Only set if lock_duration is not 'none'
                            items: items.map(item => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                            })),
                            metadata: {
                                userId: user?.uid || 'guest',
                                customerEmail: user?.email || '',
                                customerName: user?.displayName || '',
                                customerCurrency: currency,
                                baseAmountGBP: baseTotalPrice.toString(),
                            },
                        }),
                    });

                    const data = await response.json();
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                        setPaymentIntentId(data.paymentIntentId);
                    } else if (data.error) {
                        useToastStore.getState().addToast({
                            type: 'error',
                            title: 'Payment Error',
                            message: data.error,
                        });
                    }
                } catch (error) {
                    console.error('Error creating payment intent:', error);
                    useToastStore.getState().addToast({
                        type: 'error',
                        title: 'Payment Error',
                        message: 'Failed to initialize payment. Please try again.',
                    });
                }
            };

            createPaymentIntent();
        }
    }, [items, baseTotalPrice, user, fxQuote, currency, isLoadingFXQuote]);

    // Removed handleChange - customer info comes from authStore

    const handlePaymentSuccess = () => {
        // Cart will be cleared after order is created (in payment-success page)
        useToastStore.getState().addToast({
            type: "success",
            title: "Payment Successful",
            message: "Your order has been placed successfully!",
        });
    };

    const handlePaymentError = (error: string) => {
        useToastStore.getState().addToast({
            type: "error",
            title: "Payment Failed",
            message: error,
        });
    };

    const handleShippingChange = (cost: number, costGBP: number) => {
        setShippingCost(cost);
        setShippingCostGBP(costGBP);
    };

    // Show loading state
    if (!hasHydrated || items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-luxury-cool-grey font-extralight">
                        {!hasHydrated ? 'Loading...' : 'Redirecting to cart...'}
                    </p>
                </div>
            </div>
        );
    }

    // Show checkout options only if not selected yet AND user is not logged in
    // If user is logged in, we'll skip this and go directly to checkout
    if (!checkoutOption && !user) {
        return (
            <div className="min-h-screen bg-white text-luxury-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                    <button
                        onClick={() => router.push('/cart')}
                        className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200 cursor-pointer mb-8"
                    >
                        <LuArrowLeft size={16} />
                        <span className="font-extralight uppercase">Back to Cart</span>
                    </button>
                </div>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                    <div className="bg-white p-8 border border-luxury-warm-grey/20 rounded-lg">
                        <CheckoutOptions onSelect={handleCheckoutOptionSelect} />
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state if user is logged in but checkoutOption hasn't been set yet
    if (user && !checkoutOption) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-luxury-cool-grey font-extralight">
                        Loading checkout...
                    </p>
                </div>
            </div>
        );
    }

    // If sign in selected but not logged in, show loading (will redirect)
    if (checkoutOption === 'signin' && !user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-luxury-cool-grey font-extralight">
                        Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-luxury-black">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <button
                    onClick={() => router.push('/cart')}
                    className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200 cursor-pointer"
                >
                    <LuArrowLeft size={16} />
                    <span className="font-extralight uppercase">Back to Cart</span>
                </button>
            </div>

            {/* Checkout Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-5xl font-extralight text-luxury-black mb-2 uppercase">
                    Checkout
                </h1>
                <p className="text-luxury-cool-grey font-extralight">
                    Complete your purchase
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Checkout Form */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            {/* Payment Information - Stripe Elements */}
                            <div>
                                <h2 className="text-xl font-extralight text-luxury-black mb-6 uppercase">
                                    Payment & Shipping
                                </h2>

                                {clientSecret && paymentIntentId ? (
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'stripe',
                                                variables: {
                                                    colorPrimary: '#6B46C1',
                                                    colorBackground: '#ffffff',
                                                    colorText: '#1A1A1A',
                                                    colorDanger: '#EF4444',
                                                    fontFamily: 'system-ui, sans-serif',
                                                    spacingUnit: '4px',
                                                    borderRadius: '8px',
                                                },
                                            },
                                        }}
                                    >
                                        <PaymentForm
                                            userEmail={user?.email || ''}
                                            userName={user?.displayName || ''}
                                            isGuest={checkoutOption === 'guest'}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            totalPrice={baseTotalPrice}
                                            clientSecret={clientSecret}
                                            paymentIntentId={paymentIntentId}
                                            onShippingChange={handleShippingChange}
                                            currency={currency}
                                            exchangeRate={exchangeRate}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="bg-white p-6 rounded-lg">
                                        <p className="text-luxury-cool-grey font-extralight text-sm">
                                            Initializing payment...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white p-8 sticky top-8"
                        >
                            <h3 className="text-xl font-extralight text-luxury-black mb-6 uppercase">
                                Order Summary
                            </h3>

                            <div className="space-y-4 mb-6">
                                {items.map((item: CartItem) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-extralight text-sm">{item.name}</p>
                                                <p className="text-luxury-cool-grey font-extralight text-xs">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <CheckoutItemPrice price={item.price} quantity={item.quantity} />
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-luxury-cool-grey pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-luxury-cool-grey font-extralight">Subtotal</span>
                                    <span className="font-extralight">{formattedTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-luxury-cool-grey font-extralight">Shipping</span>
                                    <span className="font-extralight">
                                        {shippingCostGBP > 0 ? shippingFormatted : 'Select shipping address'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="text-luxury-black font-extralight">Total</span>
                                    <span className="text-luxury-black font-extralight">
                                        {totalFormatted}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
