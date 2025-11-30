'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LuArrowLeft, LuPlus, LuMinus, LuTrash2, LuShoppingBag } from 'react-icons/lu';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { usePrice } from '@/hooks/usePrice';

// Component for displaying item price
const ItemPriceDisplay: React.FC<{ price: number; quantity: number }> = ({ price, quantity }) => {
    const itemTotal = price * quantity;
    const { formattedPrice } = usePrice(itemTotal);
    return <p className="text-2xl font-extralight text-luxury-black">{formattedPrice}</p>;
};

export default function Cart() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCartStore();

    // Format total price
    const totalPrice = getTotalPrice();
    const { formattedPrice: formattedTotal } = usePrice(totalPrice);

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white text-luxury-black">
                {/* Back Button */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200 cursor-pointer"
                    >
                        <LuArrowLeft size={16} />
                        <span className="font-extralight uppercase">Continue Shopping</span>
                    </button>
                </div>

                {/* Empty Cart */}
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
                            <LuShoppingBag className="text-luxury-cool-grey" size={32} />
                        </div>
                        <h2 className="text-[36px] font-extralight text-luxury-black mb-4 uppercase">
                            Your Cart is Empty
                        </h2>
                        <p className="text-luxury-cool-grey font-extralight mb-8 max-w-md">
                            Discover our handcrafted luxury baskets and add some elegance to your collection.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-3 border border-brand-purple text-brand-purple px-8 py-3 font-extralight uppercase hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
                        >
                            <span>Start Shopping</span>
                            <LuArrowLeft size={16} className="rotate-180" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-luxury-black">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200 cursor-pointer"
                >
                    <LuArrowLeft size={16} />
                    <span className="font-extralight uppercase">Continue Shopping</span>
                </button>
            </div>

            {/* Cart Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-[48px] font-extralight text-luxury-black mb-2 uppercase">
                            Shopping Cart
                        </h1>
                        <p className="text-luxury-cool-grey font-extralight">
                            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-luxury-cool-grey hover:text-red-500 transition-colors duration-200 font-extralight uppercase text-sm cursor-pointer"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {items.map((item: CartItem, index: number) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-luxury-white/20"
                            >
                                {/* Product Image */}
                                <div className="md:col-span-1 relative w-full h-full">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="md:col-span-2 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-extralight text-luxury-black mb-2 uppercase">
                                            {item.name.replace(/^Custom /, '')}
                                        </h3>
                                        {item.category !== 'Custom Basket' && (
                                            <p className="text-brand-purple text-sm font-extralight uppercase mb-2">
                                                {item.category}
                                            </p>
                                        )}

                                        {/* Basket Items Photos - Custom or Normal Baskets */}
                                        {((item.category === 'Custom Basket' && item.customItems && item.customItems.length > 0) ||
                                            (item.category === 'Baskets' && item.basketItems && item.basketItems.length > 0)) && (
                                                <div className="mt-4">
                                                    {/* Show "+ Basket" indicator for custom baskets */}
                                                    {item.category === 'Custom Basket' && (
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded text-xs font-extralight text-brand-purple uppercase">
                                                                <LuPlus size={12} />
                                                                <span>Basket Included</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        {(() => {
                                                            const itemsToShow = item.category === 'Custom Basket'
                                                                ? item.customItems?.slice(0, 5) || []
                                                                : item.basketItems?.slice(0, 5) || [];

                                                            return (
                                                                <>
                                                                    {itemsToShow.map((basketItem: { name: string; image: string }, idx: number) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="w-12 h-12 rounded-sm overflow-hidden border border-luxury-warm-grey/20 shrink-0 relative"
                                                                        >
                                                                            <Image
                                                                                src={basketItem.image}
                                                                                alt={basketItem.name}
                                                                                fill
                                                                                className="object-cover"
                                                                                sizes="48px"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {/* Fill remaining slots with empty squares if less than 5 items */}
                                                                    {Array.from({ length: Math.max(0, 5 - itemsToShow.length) }).map((_, idx) => (
                                                                        <div
                                                                            key={`empty-${idx}`}
                                                                            className="w-12 h-12 rounded-sm border border-dashed border-luxury-warm-grey/20 shrink-0 bg-luxury-warm-grey/5"
                                                                        />
                                                                    ))}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                    <div className="mt-4">
                                        <ItemPriceDisplay price={item.price} quantity={item.quantity} />
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="md:col-span-1 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-extralight text-luxury-cool-grey uppercase">
                                            Quantity
                                        </span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 border border-luxury-cool-grey flex items-center justify-center hover:border-brand-purple transition-colors duration-200 cursor-pointer"
                                        >
                                            <LuMinus size={12} />
                                        </button>
                                        <span className="text-lg font-extralight text-luxury-black min-w-[2rem] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 border border-luxury-cool-grey flex items-center justify-center hover:border-brand-purple transition-colors duration-200 cursor-pointer"
                                        >
                                            <LuPlus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary (Sidebar) */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-white p-8 sticky top-8"
                        >
                            <h3 className="text-[24px] font-extralight text-luxury-black mb-6 uppercase">
                                Order Summary
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-luxury-cool-grey font-extralight">Subtotal</span>
                                    <span className="font-extralight">{formattedTotal}</span>
                                </div>
                                <div className="border-t border-luxury-cool-grey pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-luxury-black font-extralight text-lg">Total</span>
                                        <span className="text-luxury-black font-extralight text-lg">
                                            {formattedTotal}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full text-center py-3 px-4 bg-brand-purple text-luxury-white font-extralight uppercase hover:bg-brand-purple-light transition-colors duration-200"
                            >
                                Proceed to Checkout
                            </Link>
                            <p className="text-xs text-luxury-cool-grey font-extralight mt-2 text-center">
                                You can sign in or checkout as a guest
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
