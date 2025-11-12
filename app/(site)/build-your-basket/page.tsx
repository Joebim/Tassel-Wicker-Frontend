'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LuArrowLeft, LuSearch, LuX, LuShoppingCart } from 'react-icons/lu';
import { useCustomBasketStore, type CustomBasketItem } from '@/store/customBasketStore';
import { useCartStore } from '@/store/cartStore';
import { getAllProducts } from '@/utils/productData';
import { useToastStore } from '@/store/toastStore';
import { getDefaultVariant } from '@/utils/productHelpers';
import { usePrice, usePriceFormat } from '@/hooks/usePrice';

// Price display components
const ProductPriceDisplay: React.FC<{ price: number }> = ({ price }) => {
    const { formattedPrice } = usePrice(price);
    return <span className="text-sm font-extralight text-luxury-black">{formattedPrice}</span>;
};

const BasketTotalPriceDisplay: React.FC<{ totalPrice: number }> = ({ totalPrice }) => {
    const { formattedPrice } = usePriceFormat(totalPrice);
    return <div className="text-2xl font-extralight text-luxury-black">{formattedPrice}</div>;
};

const ItemPriceDisplaySmall: React.FC<{ price: number }> = ({ price }) => {
    const { formattedPrice } = usePriceFormat(price);
    return <p className="text-xs text-luxury-cool-grey font-extralight">{formattedPrice}</p>;
};

export default function BuildYourBasket() {
    const router = useRouter();
    const MIN_SELECTION = 3;
    const MAX_SELECTION = 5;
    const { currentBasket, setBasketType, addItem, removeItem, clearBasket, pendingItems } = useCustomBasketStore();
    const selectionCount = currentBasket?.selectedItems.length ?? 0;
    const { addItem: addToCart } = useCartStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    // Track selected variant for each product by product ID
    const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
    const [showOverlay, setShowOverlay] = useState(!currentBasket);

    useEffect(() => {
        if (currentBasket) {
            // Use setTimeout to avoid synchronous setState in effect
            const timer = setTimeout(() => {
                setShowOverlay(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [currentBasket]);

    const allProducts = getAllProducts();

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(allProducts.map((p) => p.category)))];

    // Filter products based on search and category
    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [allProducts, searchTerm, selectedCategory]);

    const handleBasketTypeSelect = (type: 'natural' | 'black') => {
        const queuedCount = pendingItems.length;
        setBasketType(type);
        if (queuedCount > 0) {
            useToastStore.getState().addToast({
                type: 'success',
                title: queuedCount === 1 ? 'Item Added' : 'Items Added',
                message: queuedCount === 1
                    ? 'Your selected item has been added to this basket.'
                    : 'Your queued items have been added to this basket.',
            });
        }
    };

    const handleAddToCart = () => {
        if (!currentBasket) return;

        if (currentBasket.selectedItems.length < MIN_SELECTION) {
            useToastStore.getState().addToast({
                type: "warning",
                title: "Select Three Items",
                message: "Please choose at least three products to build your custom basket.",
            });
            return;
        }

        // Create a custom basket item for the cart
        const customBasketItem = {
            id: currentBasket.id,
            name: `Custom ${currentBasket.basketType === 'natural' ? 'Natural' : 'Black'} Basket`,
            price: currentBasket.totalPrice,
            image: currentBasket.basketType === 'natural'
                ? 'https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523697/WICKER_BASKET_jy5cs6.jpg'
                : 'https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523728/BLACK_WICKER_BASKET_xhdnno.jpg',
            category: 'Custom Basket',
            description: `Custom basket with ${currentBasket.selectedItems.length} selected items`,
            customItems: currentBasket.selectedItems
        };

        addToCart(customBasketItem);

        useToastStore.getState().addToast({
            type: "success",
            title: "Custom Basket Added",
            message: "Your custom basket has been added to your cart!",
        });

        clearBasket();
        router.push('/cart');
    };

    // Scroll to top on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    return (
        <div className="relative min-h-screen bg-luxury-white">
            {/* Intro Overlay */}
            <AnimatePresence>
                {showOverlay && !currentBasket && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-luxury-white/95 backdrop-blur-sm flex items-center justify-center px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="max-w-3xl text-center">
                            <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-[0.35em] text-luxury-charcoal mb-6">
                                Create a celebration basket that&apos;s uniquely yours
                            </h2>
                            <p className="text-luxury-cool-grey font-extralight text-lg leading-relaxed mb-8">
                                Choose from our range of handpicked products and build a personalised basket for any occasion.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOverlay(false);
                                    setTimeout(() => {
                                        if (typeof window !== 'undefined') {
                                            document.getElementById('basket-selection')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }, 300);
                                }}
                                className="inline-flex items-center justify-center px-10 py-3 uppercase tracking-[0.35em] text-sm font-light bg-luxury-black text-white hover:bg-luxury-black/80 transition-colors duration-200"
                            >
                                Get Started
                            </button>
                            <p className="mt-6 text-xs uppercase tracking-[0.35em] text-brand-purple">
                                Select 3–5 products to build your custom basket
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back Button - Sticky at top */}
            <div className="sticky top-0 z-50 bg-luxury-white/95 backdrop-blur-sm border-b border-luxury-warm-grey/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-full border border-luxury-warm-grey/40 bg-white/85 px-3 sm:px-4 py-2 text-luxury-charcoal backdrop-blur-md transition-colors duration-200 hover:border-brand-purple hover:text-brand-purple"
                    >
                        <LuArrowLeft size={18} />
                        <span className="font-extralight uppercase tracking-wide text-xs sm:text-sm">Back</span>
                    </button>
                </div>
            </div>

            {/* Basket Selection Section */}
            {!currentBasket && (
                <div id="basket-selection" className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-extralight uppercase tracking-wide text-luxury-charcoal mb-6">
                            Select Your Wicker Basket
                        </h2>
                        <p className="text-luxury-cool-grey font-extralight mb-6 max-w-2xl mx-auto">
                            Begin by choosing the wicker basket that sets the tone for your gift. Each colour is handcrafted by skilled weavers and finished with our signature liner.
                        </p>
                        <p className="text-xs uppercase tracking-[0.35em] text-brand-purple mb-10">
                            N:B Our wicker baskets are available exclusively as part of a personalised set and are not available for individual purchase.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Natural Wicker Basket */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="border border-luxury-warm-grey/20 rounded-lg overflow-hidden cursor-pointer hover:border-brand-purple/50 transition-all duration-300"
                                onClick={() => handleBasketTypeSelect('natural')}
                            >
                                <div className="aspect-square overflow-hidden relative">
                                    <Image
                                        src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523697/WICKER_BASKET_jy5cs6.jpg"
                                        alt="Natural Wicker Basket"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-extralight uppercase tracking-wide text-luxury-charcoal mb-2">
                                        The Natural Wicker Basket
                                    </h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        Handmade by skilled weavers, eco-friendly and designed to last
                                    </p>
                                </div>
                            </motion.div>

                            {/* Black Wicker Basket */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="border border-luxury-warm-grey/20 rounded-lg overflow-hidden cursor-pointer hover:border-brand-purple/50 transition-all duration-300"
                                onClick={() => handleBasketTypeSelect('black')}
                            >
                                <div className="aspect-square overflow-hidden relative">
                                    <Image
                                        src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761523728/BLACK_WICKER_BASKET_xhdnno.jpg"
                                        alt="Black Wicker Basket"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-extralight uppercase tracking-wide text-luxury-charcoal mb-2">
                                        The Black Wicker Basket
                                    </h3>
                                    <p className="text-luxury-cool-grey font-extralight text-sm">
                                        Handmade by skilled weavers, eco-friendly and designed to last
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Selection Section */}
            {currentBasket && (
                <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] overflow-hidden pt-12 lg:pt-0">
                    {/* Left Side - Product List (35%) */}
                    <div className="w-full lg:flex-[3.5] bg-luxury-warm-grey/5 border-r border-luxury-warm-grey/20 overflow-hidden flex flex-col">
                        <div className="p-6 shrink-0">
                            {/* Product Count */}
                            <div className="mb-4">
                                <p className="text-sm text-luxury-cool-grey font-extralight uppercase">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxury-cool-grey" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-luxury-warm-grey/20 rounded-lg bg-luxury-white focus:outline-none focus:border-brand-purple/50 transition-colors duration-200 font-extralight"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-luxury-warm-grey/20 rounded-lg bg-luxury-white focus:outline-none focus:border-brand-purple/50 transition-colors duration-200 font-extralight"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 max-h-[calc(100vh-100px)]">
                            <div className="space-y-3">
                                {filteredProducts.map((product) => {
                                    // Get current variant to check selection
                                    const variants = product.variants ?? [];
                                    const variantIndex = selectedVariants[product.id] ?? 0;
                                    const hasVariants = variants.length > 1;
                                    const currentVariant = hasVariants
                                        ? variants[variantIndex] ?? variants[0]
                                        : getDefaultVariant(product);
                                    const variantName = hasVariants ? currentVariant.name : undefined;

                                    // Create unique ID for checking selection
                                    const itemUniqueId = hasVariants && variantName
                                        ? `${product.id}-${variantName.toLowerCase().replace(/\s+/g, '-')}`
                                        : product.id;

                                    const isSelected = currentBasket.selectedItems.some((item) => item.id === itemUniqueId);
                                    const canAdd = selectionCount < MAX_SELECTION && !isSelected;

                                    const currentImage = currentVariant.image;
                                    const currentPrice = currentVariant.price;

                                    const handleVariantSelect = (e: React.MouseEvent, index: number) => {
                                        e.stopPropagation(); // Prevent triggering the item click
                                        setSelectedVariants(prev => ({
                                            ...prev,
                                            [product.id]: index
                                        }));
                                    };

                                    const handleAddItem = (e?: React.MouseEvent) => {
                                        if (e) {
                                            e.stopPropagation(); // Prevent double-trigger if called from button
                                        }
                                        if (!canAdd) {
                                            useToastStore.getState().addToast({
                                                type: "info",
                                                title: isSelected ? "Already Added" : "Selection Limit Reached",
                                                message: isSelected
                                                    ? "This product is already in your basket."
                                                    : `You can select up to ${MAX_SELECTION} products in your custom basket.`,
                                            });
                                            return;
                                        }

                                        const variantName = hasVariants ? currentVariant.name : undefined;
                                        const itemName = variantName && variantName !== 'Default'
                                            ? `${product.name} - ${variantName}`
                                            : product.name;

                                        const basketItem: CustomBasketItem = {
                                            id: itemUniqueId,
                                            name: itemName,
                                            description: product.description,
                                            image: currentImage,
                                            price: currentPrice,
                                            category: product.category,
                                            variantName: variantName,
                                            details: product.details
                                        };

                                        addItem(basketItem);
                                    };

                                    return (
                                        <motion.div
                                            key={product.id}
                                            whileHover={{ scale: canAdd ? 1.02 : 1 }}
                                            onClick={() => canAdd && handleAddItem()}
                                            className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                                ? 'border-brand-purple/50 bg-brand-purple/5 cursor-default'
                                                : canAdd
                                                    ? 'border-luxury-warm-grey/20 hover:border-brand-purple/30 hover:bg-luxury-warm-grey/5'
                                                    : 'border-luxury-warm-grey/20 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
                                                    <Image
                                                        src={currentImage}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-extralight text-sm uppercase tracking-wide text-luxury-charcoal mb-1">
                                                        {product.name}
                                                    </h4>
                                                    <p
                                                        className="text-xs text-luxury-cool-grey font-extralight mb-2"
                                                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                                    >
                                                        {product.description}
                                                    </p>

                                                    {/* Variant Selector */}
                                                    {hasVariants && (
                                                        <div className="mb-2">
                                                            <label className="block text-xs font-extralight text-luxury-charcoal mb-1 uppercase">
                                                                Variant
                                                            </label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {variants.map((variant, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={(e) => handleVariantSelect(e, index)}
                                                                        className={`px-2 py-1 text-xs rounded transition-all duration-200 font-extralight uppercase ${variantIndex === index
                                                                            ? 'bg-brand-purple text-luxury-white'
                                                                            : 'bg-luxury-warm-grey/10 text-luxury-charcoal hover:bg-luxury-warm-grey/20'
                                                                            }`}
                                                                    >
                                                                        {variant.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <ProductPriceDisplay price={currentPrice} />
                                                        {isSelected && (
                                                            <span className="text-xs text-brand-purple font-extralight uppercase">
                                                                Added
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Basket Details (65%) */}
                    <div className="w-full lg:flex-[6.5] p-6 sm:p-8">
                        <div className="max-w-2xl">
                            {/* Basket Info */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-extralight uppercase tracking-wide text-luxury-charcoal mb-2">
                                    Your Custom Basket
                                </h2>
                                <p className="text-luxury-cool-grey font-extralight mb-4">
                                    {currentBasket.basketType === 'natural' ? 'Natural' : 'Black'} Wicker Basket
                                </p>
                                <p className="text-xs uppercase tracking-[0.3em] text-brand-purple mb-4">
                                    {selectionCount}/{MAX_SELECTION} items selected · Minimum of {MIN_SELECTION} required
                                </p>
                                <BasketTotalPriceDisplay totalPrice={currentBasket.totalPrice} />
                            </div>

                            {/* Selected Items Card */}
                            <div className="border border-luxury-warm-grey/20 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-extralight uppercase tracking-wide text-luxury-charcoal mb-4">
                                    Selected Items ({selectionCount}/{MAX_SELECTION})
                                </h3>

                                {selectionCount === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-lg border-2 border-dashed border-luxury-warm-grey/30 flex items-center justify-center">
                                            <LuShoppingCart size={24} className="text-luxury-cool-grey" />
                                        </div>
                                        <p className="text-luxury-cool-grey font-extralight">
                                            No items selected yet
                                        </p>
                                        <p className="text-xs text-luxury-cool-grey font-extralight mt-1">
                                            Choose up to 5 products from the list
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {currentBasket.selectedItems.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-luxury-warm-grey/5 rounded-lg">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-extralight text-sm uppercase tracking-wide text-luxury-charcoal">
                                                        {item.name}
                                                    </h4>
                                                    {item.variantName && item.variantName !== 'Default' && (
                                                        <p className="text-xs text-brand-purple font-extralight mb-1">
                                                            {item.variantName}
                                                        </p>
                                                    )}
                                                    <ItemPriceDisplaySmall price={item.price} />
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 text-luxury-cool-grey hover:text-red-500 transition-colors duration-200"
                                                >
                                                    <LuX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={selectionCount < MIN_SELECTION}
                                className={`w-full py-4 px-6 rounded-lg font-extralight uppercase tracking-wide transition-all duration-200 ${selectionCount >= MIN_SELECTION
                                    ? 'bg-brand-purple text-luxury-white hover:bg-brand-purple/90'
                                    : 'bg-luxury-warm-grey/20 text-luxury-cool-grey cursor-not-allowed'
                                    }`}
                            >
                                Add Custom Basket to Cart
                            </button>
                            {selectionCount < MIN_SELECTION && (
                                <p className="mt-3 text-xs text-luxury-cool-grey font-extralight text-center uppercase">
                                    Select at least {MIN_SELECTION} products to proceed.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
