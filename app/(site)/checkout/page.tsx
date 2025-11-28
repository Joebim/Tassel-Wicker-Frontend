'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { LuArrowLeft } from 'react-icons/lu';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { usePrice } from '@/hooks/usePrice';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutItemPrice: React.FC<{ price: number; quantity: number }> = ({ price, quantity }) => {
    const { formattedPrice } = usePrice(price * quantity);
    return <p className="font-extralight">{formattedPrice}</p>;
};

const PaymentForm: React.FC<{
    clientSecret: string;
    onSuccess: () => void;
    onError: (msg: string) => void;
}> = ({ clientSecret, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // PaymentElement will display the total automatically including shipping

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError('');

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message!);
            setIsProcessing(false);
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setError(error.message || 'Payment failed');
            onError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        wallets: { applePay: 'auto', googlePay: 'auto' },
                        business: { name: 'Tassel & Wicker' },
                        fields: {
                            billingDetails: {
                                name: 'auto',
                                email: 'auto',
                                address: { country: 'auto', line1: 'auto', postalCode: 'auto' },
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-extralight"
                >
                    {error}
                </motion.div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-5 bg-brand-purple text-white font-extralight uppercase tracking-wider hover:bg-brand-purple-light transition disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : 'Complete Payment'}
            </button>
        </form>
    );
};

export default function Checkout() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user, hasHydrated } = useAuthStore();
    const baseTotal = getTotalPrice(); // in pence (GBP)
    const { formattedPrice: subtotalFormatted } = usePrice(baseTotal);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (!hasHydrated || items.length === 0 || !user) return;

        const createIntent = async () => {
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: baseTotal,
                    items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
                    metadata: { userId: user.uid },
                }),
            });

            const data = await res.json();
            if (data.clientSecret) setClientSecret(data.clientSecret);
        };

        createIntent();
    }, [items, baseTotal, user, hasHydrated]);

    const handleSuccess = () => {
        clearCart();
        useToastStore.getState().addToast({
            type: 'success',
            title: 'Order Complete!',
            message: 'Thank you for your purchase.',
        });
    };

    if (!hasHydrated || items.length === 0 || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-luxury-cool-grey">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-luxury-black">
            <div className="max-w-7xl mx-auto px-4 py-24">
                <button
                    onClick={() => router.push('/cart')}
                    className="flex items-center gap-2 text-luxury-cool-grey hover:text-black mb-8"
                >
                    <LuArrowLeft /> <span className="font-extralight uppercase">Back to Cart</span>
                </button>

                <h1 className="text-5xl font-extralight uppercase mb-12">Checkout</h1>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left: Payment */}
                    <div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-2xl font-extralight uppercase mb-8">Payment Details</h2>

                            {clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                    <PaymentForm clientSecret={clientSecret} onSuccess={handleSuccess} onError={() => { }} />
                                </Elements>
                            ) : (
                                <div className="bg-gray-50 p-8 rounded-lg text-center">
                                    <p className="text-luxury-cool-grey">Initializing secure payment...</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right: Summary */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border p-8 sticky top-8"
                        >
                            <h3 className="text-2xl font-extralight uppercase mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 relative shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                                            </div>
                                            <div>
                                                <p className="font-extralight">{item.name}</p>
                                                <p className="text-xs text-luxury-cool-grey">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <CheckoutItemPrice price={item.price} quantity={item.quantity} />
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-6 space-y-3">
                                <div className="flex justify-between text-luxury-cool-grey">
                                    <span>Subtotal</span>
                                    <span>{subtotalFormatted}</span>
                                </div>
                                <div className="flex justify-between text-luxury-cool-grey">
                                    <span>Shipping</span>
                                    <span className="italic">Selected at checkout</span>
                                </div>
                                <div className="flex justify-between text-xl font-light pt-4 border-t">
                                    <span>Total</span>
                                    <span className="font-medium">See in payment form →</span>
                                </div>
                                <p className="text-xs text-luxury-cool-grey mt-4 italic">
                                    Final total includes shipping & currency conversion (if applicable)
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}