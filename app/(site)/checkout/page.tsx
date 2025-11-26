'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { LuArrowLeft, LuMapPin } from 'react-icons/lu';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { usePrice } from '@/hooks/usePrice';
import { useCurrencyStore } from '@/store/currencyStore';
import useCountries, { type Country } from '@/hooks/useCountries';
import { getShippingRates, getShippingRateById, type ShippingRate } from '@/utils/shippingRates';
import { convertPrice } from '@/utils/priceUtils';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Helper functions for country handling
const getCountryByName = (countries: Country[], countryName: string): Country | undefined => {
    return countries.find((c: Country) => c.name === countryName);
};

const getCountryIso2 = (countries: Country[], countryName: string): string => {
    const country = getCountryByName(countries, countryName);
    return country?.iso2 || 'US'; // Fallback to US if not found
};

// Component for displaying item price
const CheckoutItemPrice: React.FC<{ price: number; quantity: number }> = ({ price, quantity }) => {
    const itemTotal = price * quantity;
    const { formattedPrice } = usePrice(itemTotal);
    return <p className="font-extralight">{formattedPrice}</p>;
};

// Payment Form Component (uses Stripe Elements)
const PaymentForm: React.FC<{
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    countries: Country[];
    onSuccess: () => void;
    onError: (error: string) => void;
    totalPrice: number;
    shippingCost: number;
    clientSecret: string;
}> = ({ formData, countries, onSuccess, onError, totalPrice, shippingCost, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const { formattedPrice } = usePrice(totalPrice + shippingCost);

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

            // Store customer info in localStorage for email sending on success page
            if (typeof window !== 'undefined') {
                localStorage.setItem('checkout_customer_email', formData.email);
                localStorage.setItem('checkout_first_name', formData.firstName);
                localStorage.setItem('checkout_last_name', formData.lastName);
            }

            // Confirm payment with existing clientSecret
            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                    receipt_email: formData.email, // Set receipt email on payment intent
                    payment_method_data: {
                        billing_details: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            address: {
                                line1: formData.address,
                                city: formData.city,
                                postal_code: formData.postalCode,
                                country: getCountryIso2(countries, formData.country),
                            },
                        },
                    },
                    shipping: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        address: {
                            line1: formData.address,
                            city: formData.city,
                            postal_code: formData.postalCode,
                            country: getCountryIso2(countries, formData.country),
                        },
                    },
                },
                redirect: 'if_required', // Only redirect if required by payment method
            });

            if (confirmError) {
                setError(confirmError.message || 'Payment failed. Please try again.');
                setIsProcessing(false);
            } else {
                // Payment succeeded - check if we got a payment intent back
                // If no redirect happened, we need to extract the payment intent ID
                const result = await stripe.retrievePaymentIntent(clientSecret);

                if (result.paymentIntent?.status === 'succeeded') {
                    const paymentIntentId = result.paymentIntent.id;
                    console.log('[CHECKOUT] Payment succeeded without redirect, payment intent:', paymentIntentId);

                    // Send email immediately since no redirect will happen
                    console.log('[CHECKOUT] Sending email from checkout page...');
                    try {
                        const emailResponse = await fetch('/api/send-order-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                paymentIntentId: paymentIntentId,
                                customerEmail: formData.email,
                                customerName: `${formData.firstName} ${formData.lastName}`,
                            }),
                        });
                        const emailData = await emailResponse.json();
                        if (emailData.success) {
                            console.log('[CHECKOUT] Email sent successfully from checkout page');
                        } else {
                            console.error('[CHECKOUT] Failed to send email:', emailData.error);
                        }
                    } catch (emailError) {
                        console.error('[CHECKOUT] Error sending email:', emailError);
                    }

                    // Redirect to success page manually
                    window.location.href = `/payment-success?payment_intent=${paymentIntentId}&payment_intent_client_secret=${clientSecret}`;
                } else {
                    // Payment requires redirect, will redirect to return_url
                    // Cart will be cleared in payment-success page
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
            <div className="bg-white p-6 rounded-lg">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        // Show wallet payment methods prominently (Apple Pay, Google Pay)
                        wallets: {
                            applePay: 'auto',
                            googlePay: 'auto',
                        },
                        // Business information for Apple Pay/Google Pay
                        business: {
                            name: 'Tassel & Wicker',
                        },
                        // Terms and conditions
                        terms: {
                            card: 'always',
                        },
                        // Fields configuration
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
                className="w-full py-4 px-6 bg-brand-purple text-luxury-white font-extralight uppercase hover:bg-brand-purple-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing Payment...' : `Complete Order - ${formattedPrice}`}
            </button>
        </form>
    );
};

export default function Checkout() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user, hasHydrated } = useAuthStore();
    const { currency, location } = useCurrencyStore();
    const baseTotalPrice = getTotalPrice();
    const { formattedPrice: formattedTotal, finalPrice: convertedTotalPrice } = usePrice(baseTotalPrice);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const { countries, isLoading: isLoadingCountries } = useCountries();

    // Get default country from currencyStore location, fallback to United States
    const getDefaultCountryName = (): string => {
        if (location?.country) {
            return location.country;
        }
        return 'United States';
    };

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        address: '',
        city: '',
        postalCode: '',
        country: getDefaultCountryName()
    });

    // Shipping state
    const [selectedShippingRate, setSelectedShippingRate] = useState<string | null>(null);
    const [availableShippingRates, setAvailableShippingRates] = useState<ShippingRate[]>([]);

    // Set default country when countries are loaded or location changes
    useEffect(() => {
        if (countries.length > 0) {
            // Get the country from currencyStore location
            let targetCountry: Country | undefined;

            if (location?.country) {
                // Try to find by country name first
                targetCountry = getCountryByName(countries, location.country);

                // If not found by name, try to find by countryCode (iso2)
                if (!targetCountry && location.countryCode) {
                    targetCountry = countries.find((c: Country) => c.iso2 === location.countryCode);
                }
            }

            // Fallback to United States if location country not found
            if (!targetCountry) {
                targetCountry = countries.find((c: Country) => c.name === 'United States');
            }

            // Final fallback to first country
            if (!targetCountry) {
                targetCountry = countries[0];
            }

            if (targetCountry) {
                const targetCountryName = targetCountry.name;
                const locationCountry = location?.country;

                // Use setTimeout to avoid synchronous setState in effect
                const timer = setTimeout(() => {
                    setFormData(prev => {
                        // Check if current country exists in the loaded countries
                        const prevCountryExists = getCountryByName(countries, prev.country);

                        // Update if:
                        // 1. Current country doesn't exist in the list, OR
                        // 2. Location has a country and it's different from current selection
                        if (!prevCountryExists || (locationCountry && prev.country !== locationCountry)) {
                            return { ...prev, country: targetCountryName };
                        }
                        return prev;
                    });
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [countries, location]);

    // Update shipping rates when country changes
    useEffect(() => {
        if (formData.country && countries.length > 0) {
            const country = getCountryByName(countries, formData.country);
            if (country?.iso2) {
                const rates = getShippingRates(country.iso2);
                setAvailableShippingRates(rates);
                // Auto-select first shipping rate if none selected
                if (!selectedShippingRate && rates.length > 0) {
                    setSelectedShippingRate(rates[0].id);
                }
            }
        }
    }, [formData.country, countries, selectedShippingRate]);

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

    // Require authentication before checkout – redirect guests to login
    useEffect(() => {
        if (!hasHydrated) return;
        if (!user) {
            router.push('/login?redirect=/checkout');
        }
    }, [hasHydrated, user, router]);

    // Calculate shipping cost
    const shippingCost = useMemo(() => {
        if (!selectedShippingRate || !formData.country || countries.length === 0) {
            return 0;
        }
        const country = getCountryByName(countries, formData.country);
        if (!country?.iso2) return 0;

        const rate = getShippingRateById(selectedShippingRate, country.iso2);
        if (!rate) return 0;

        // Convert shipping cost from GBP to user's currency
        return convertPrice(rate.price, currency as 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD' | 'JPY' | 'NGN' | 'ZAR');
    }, [selectedShippingRate, formData.country, countries, currency]);

    // Calculate shipping and total prices for display
    const { formattedPrice: shippingFormattedPrice } = usePrice(shippingCost);
    const { formattedPrice: totalFormattedPrice } = usePrice(convertedTotalPrice + shippingCost);

    // Create payment intent when component mounts or when cart/price/shipping changes
    // Note: Customer info (formData.email, formData.firstName, formData.lastName) is intentionally
    // not in dependencies to avoid recreating payment intent on every form field change.
    // Customer info is also captured in the confirmPayment call and will be available in webhook.
    useEffect(() => {
        if (items.length > 0 && convertedTotalPrice > 0) {
            const createPaymentIntent = async () => {
                try {
                    const country = getCountryByName(countries, formData.country);
                    const response = await fetch('/api/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: convertedTotalPrice, // Use converted price, not base price
                            currency: currency.toLowerCase(),
                            shippingCost: shippingCost,
                            shippingAddress: country ? {
                                country: country.iso2,
                                city: formData.city,
                                postalCode: formData.postalCode,
                            } : undefined,
                            items: items.map(item => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                            })),
                            metadata: {
                                userId: user?.uid || 'guest',
                                // Include customer info if available (may be empty on initial mount)
                                customerEmail: formData.email || '',
                                customerName: formData.firstName && formData.lastName
                                    ? `${formData.firstName} ${formData.lastName}`
                                    : '',
                                shippingMethod: selectedShippingRate || '',
                            },
                        }),
                    });

                    const data = await response.json();
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, convertedTotalPrice, currency, user, shippingCost, selectedShippingRate, formData.country, formData.city, formData.postalCode, countries]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePaymentSuccess = () => {
        clearCart();
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

    // Show loading state while checking authentication or if cart is empty
    if (!hasHydrated || items.length === 0 || !user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-luxury-cool-grey font-extralight">
                        {!hasHydrated ? 'Loading...' : items.length === 0 ? 'Redirecting to cart...' : 'Redirecting to login...'}
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
                    Complete your luxury purchase
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
                            {/* Shipping Information */}
                            <div>
                                <h2 className="text-2xl font-extralight text-luxury-black mb-6 uppercase flex items-center gap-3">
                                    <LuMapPin size={20} />
                                    Shipping Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            required
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">
                                            Country
                                        </label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            disabled={isLoadingCountries}
                                            className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoadingCountries ? (
                                                <option value="">Loading countries...</option>
                                            ) : countries.length === 0 ? (
                                                <option value="">No countries available</option>
                                            ) : (
                                                [...countries]
                                                    .sort((a: Country, b: Country) => a.name.localeCompare(b.name))
                                                    .map((country: Country) => (
                                                        <option key={country.iso2 || `country-${country.id}`} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Options */}
                            {availableShippingRates.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-extralight text-luxury-black mb-6 uppercase flex items-center gap-3">
                                        <LuMapPin size={20} />
                                        Shipping Method
                                    </h2>
                                    <div className="space-y-3">
                                        {availableShippingRates.map((rate) => {
                                            const ratePrice = convertPrice(rate.price, currency as 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD' | 'JPY' | 'NGN' | 'ZAR');
                                            const ShippingRatePriceDisplay: React.FC = () => {
                                                const { formattedPrice } = usePrice(ratePrice);
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
                                                            onChange={(e) => setSelectedShippingRate(e.target.value)}
                                                            className="w-4 h-4 text-brand-purple focus:ring-brand-purple"
                                                        />
                                                        <div>
                                                            <p className="font-extralight text-luxury-black">{rate.name}</p>
                                                            <p className="text-sm text-luxury-cool-grey font-extralight">
                                                                {rate.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <ShippingRatePriceDisplay />
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Payment Information - Stripe Elements */}
                            <div>
                                <h2 className="text-2xl font-extralight text-luxury-black mb-6 uppercase">
                                    Payment Information
                                </h2>

                                {clientSecret ? (
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
                                            formData={formData}
                                            countries={countries}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            totalPrice={baseTotalPrice}
                                            shippingCost={shippingCost}
                                            clientSecret={clientSecret}
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
                            <h3 className="text-2xl font-extralight text-luxury-black mb-6 uppercase">
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
                                        {shippingCost > 0 ? shippingFormattedPrice : 'Free'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="text-luxury-black font-extralight">Total</span>
                                    <span className="text-luxury-black font-extralight">
                                        {totalFormattedPrice}
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
