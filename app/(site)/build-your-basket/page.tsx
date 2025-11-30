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
import { usePrice } from '@/hooks/usePrice';

// Price display components
const ProductPriceDisplay: React.FC<{ price: number }> = ({ price }) => {
    const { formattedPrice } = usePrice(price);
    return <span className="text-sm font-extralight text-luxury-black">{formattedPrice}</span>;
};

const BasketTotalPriceDisplay: React.FC<{ totalPrice: number }> = ({ totalPrice }) => {
    const { formattedPrice } = usePrice(totalPrice);
    return <div className="text-2xl font-extralight text-luxury-black">{formattedPrice}</div>;
};

const ItemPriceDisplaySmall: React.FC<{ price: number }> = ({ price }) => {
    const { formattedPrice } = usePrice(price);
    return <p className="text-xs text-luxury-cool-grey font-extralight">{formattedPrice}</p>;
};

export default function BuildYourBasket() {
    const router = useRouter();
    const MIN_SELECTION = 3;
    const MAX_SELECTION = 5;
    const { currentBasket, setBasketType, addItem, removeItem, clearBasket } = useCustomBasketStore();
    const selectionCount = currentBasket?.selectedItems.length ?? 0;
    const { addItem: addToCart } = useCartStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    // Track selected variant for each product by product ID
    const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
    const [showOverlay, setShowOverlay] = useState(!currentBasket);
    const [selectedProduct, setSelectedProduct] = useState<typeof allProducts[0] | null>(null);
    const [modalVariantIndex, setModalVariantIndex] = useState<Record<string, number>>({});

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

    // Filter out black and natural wicker baskets from build your basket products
    const availableProducts = useMemo(() => {
        return allProducts.filter((product) => {
            const productName = product.name.toLowerCase();
            return !productName.includes('black wicker basket') &&
                !productName.includes('natural wicker basket');
        });
    }, [allProducts]);

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(availableProducts.map((p) => p.category)))];

    // Filter products based on search and category
    const filteredProducts = useMemo(() => {
        return availableProducts.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [availableProducts, searchTerm, selectedCategory]);

    const handleBasketTypeSelect = (type: 'natural' | 'black') => {
        setBasketType(type);
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;

        const variants = selectedProduct.variants ?? [];
        const variantIdx = modalVariantIndex[selectedProduct.id] ?? 0;
        const hasVariants = variants.length > 1;
        const currentVariant = hasVariants
            ? variants[variantIdx] ?? variants[0]
            : getDefaultVariant(selectedProduct);

        const variantName = hasVariants ? currentVariant.name : undefined;
        const itemUniqueId = hasVariants && variantName
            ? `${selectedProduct.id}-${variantName.toLowerCase().replace(/\s+/g, '-')}`
            : selectedProduct.id;

        const isItemSelected = currentBasket?.selectedItems.some((item) => item.id === itemUniqueId);
        const canAddItem = selectionCount < MAX_SELECTION && !isItemSelected;

        if (!canAddItem) {
            useToastStore.getState().addToast({
                type: "info",
                title: isItemSelected ? "Already Added" : "Selection Limit Reached",
                message: isItemSelected
                    ? "This product is already in your basket."
                    : `You can select up to ${MAX_SELECTION} products in your custom basket.`,
            });
            return;
        }

        const itemName = variantName && variantName !== 'Default'
            ? `${selectedProduct.name} - ${variantName}`
            : selectedProduct.name;

        const basketItem: CustomBasketItem = {
            id: itemUniqueId,
            name: itemName,
            description: selectedProduct.description,
            image: currentVariant.image,
            price: currentVariant.price,
            category: selectedProduct.category,
            variantName: variantName,
            details: selectedProduct.details
        };

        addItem(basketItem);
        setSelectedProduct(null);

        useToastStore.getState().addToast({
            type: "success",
            title: "Item Added",
            message: "Product has been added to your custom basket.",
        });
    };

    // Render product details similar to learn-more page
    const renderProductDetails = (product: typeof allProducts[0]) => {
        if (!product.details) return null;

        const { details } = product;

        return (
            <div className="flex flex-col gap-5">
                {details.brand && (
                    <div className="flex flex-col gap-1.5 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Brand</h3>
                        <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">{String(details.brand)}</p>
                    </div>
                )}

                {details.ingredients && Array.isArray(details.ingredients) && (
                    <div className="flex flex-col gap-2 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Ingredients</h3>
                        <div className="flex flex-col gap-0.5">
                            {details.ingredients.map((ingredient: string, index: number) => (
                                <p key={index} className="text-black/70 font-extralight text-[13px] sm:text-[15px]">• {ingredient}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Specifications */}
                {(details.dimensions || details.weight || details.volume || details.netWeight || details.packageDimensions || details.size || details.pages || details.paper || details.material || (details.materials && Array.isArray(details.materials) && details.materials.length > 0) || details.care || details.wax || details.quantity) && (
                    <div className="flex flex-col gap-2 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Specifications</h3>
                        <div className="flex flex-col gap-1.5">
                            {details.dimensions && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Dimensions: {String(details.dimensions)}</p>
                            )}
                            {details.weight && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Weight: {String(details.weight)}</p>
                            )}
                            {details.volume && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Volume: {String(details.volume)}</p>
                            )}
                            {details.netWeight && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Net Weight: {String(details.netWeight)}</p>
                            )}
                            {details.packageDimensions && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Package Dimensions: {String(details.packageDimensions)}</p>
                            )}
                            {details.size && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Size: {String(details.size)}</p>
                            )}
                            {details.pages && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Pages: {String(details.pages)}</p>
                            )}
                            {details.paper && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Paper: {String(details.paper)}</p>
                            )}
                            {details.material && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Material: {String(details.material)}</p>
                            )}
                            {details.materials && Array.isArray(details.materials) && details.materials.length > 0 && (
                                <div className="flex flex-col gap-0.5">
                                    {details.materials.map((material: string, index: number) => (
                                        <p key={index} className="text-black/70 font-extralight text-[13px] sm:text-[15px]">
                                            • {material}
                                        </p>
                                    ))}
                                </div>
                            )}
                            {details.care && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Care: {String(details.care)}</p>
                            )}
                            {details.wax && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Wax: {String(details.wax)}</p>
                            )}
                            {details.quantity && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Quantity: {String(details.quantity)}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Storage */}
                {details.storage && (
                    <div className="flex flex-col gap-2 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Storage</h3>
                        <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">{String(details.storage)}</p>
                    </div>
                )}

                {/* Fragrance Notes */}
                {details.fragranceNotes && typeof details.fragranceNotes === 'object' && !Array.isArray(details.fragranceNotes) && (
                    <div className="flex flex-col gap-2 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Fragrance Notes</h3>
                        <div className="flex flex-col gap-1.5">
                            {details.fragranceNotes.top && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">
                                    <span>Top:</span> {String(details.fragranceNotes.top)}
                                </p>
                            )}
                            {details.fragranceNotes.middle && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">
                                    <span>Middle:</span> {String(details.fragranceNotes.middle)}
                                </p>
                            )}
                            {details.fragranceNotes.base && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">
                                    <span>Base:</span> {String(details.fragranceNotes.base)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Contents */}
                {details.contents && Array.isArray(details.contents) && (
                    <div className="flex flex-col gap-2 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Contents</h3>
                        <div className="flex flex-col gap-0.5">
                            {details.contents.map((content: string, index: number) => (
                                <p key={index} className="text-black/70 font-extralight text-[13px] sm:text-[15px]">• {content}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                {(details.alcoholContent || details.composition || details.temperatureRange || details.heatSource) && (
                    <div className="flex flex-col gap-2 border-l-2 border-brand-purple pl-4">
                        <h3 className="text-[17px] font-extralight text-luxury-black uppercase">Additional Information</h3>
                        <div className="flex flex-col gap-1.5">
                            {details.alcoholContent && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Alcohol Content: {String(details.alcoholContent)}</p>
                            )}
                            {details.composition && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Composition: {String(details.composition)}</p>
                            )}
                            {details.temperatureRange && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Temperature Range: {String(details.temperatureRange)}</p>
                            )}
                            {details.heatSource && (
                                <p className="text-black/70 font-extralight text-[13px] sm:text-[15px]">Heat Source: {String(details.heatSource)}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
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
        // Add £60 for the wicker basket price
        const basketPrice = 60;
        const itemsTotal = currentBasket.totalPrice; // Price of selected items only
        const finalPrice = itemsTotal + basketPrice; // Total including basket

        // Verify the calculation
        console.log('[Build Your Basket] Price breakdown:', {
            itemsTotal,
            basketPrice,
            finalPrice,
            itemCount: currentBasket.selectedItems.length
        });

        const customBasketItem = {
            id: currentBasket.id,
            name: `Custom ${currentBasket.basketType === 'natural' ? 'Natural' : 'Black'} Basket`,
            price: finalPrice, // This includes the £60 basket price
            image: currentBasket.basketType === 'natural'
                ? 'https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523697/WICKER_BASKET_jy5cs6.jpg'
                : 'https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523728/BLACK_WICKER_BASKET_xhdnno.jpg',
            category: 'Custom Basket',
            description: `Custom basket with ${currentBasket.selectedItems.length} selected items (includes wicker basket)`,
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
        <div className="relative min-h-screen bg-white">
            {/* Intro Overlay */}
            <AnimatePresence>
                {showOverlay && !currentBasket && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm flex items-center justify-center px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="max-w-3xl text-center">
                            <h2 className="text-3xl md:text-4xl font-extralight uppercase tracking-[0.35em] text-luxury-charcoal mb-6">
                                Create a celebration basket that is uniquely yours
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
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-luxury-warm-grey/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => {
                            if (currentBasket) {
                                // If basket is selected, clear it to go back to basket selection
                                clearBasket();
                            } else {
                                // Otherwise go back to previous page
                                router.back();
                            }
                        }}
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
                            Begin by choosing the wicker basket that sets the tone for your gift. Each basket is handcrafted by skilled weavers and finished with our signature liner.
                        </p>
                        <p className="text-xs uppercase tracking-[0.35em] text-brand-purple mb-6">
                            N:B Our wicker baskets are available exclusively as part of a personalised set and are not available for individual purchase.
                        </p>
                        <p className="text-luxury-cool-grey font-extralight italic mb-10 max-w-2xl mx-auto">
                            PRE-ORDER NOTE: Custom celebration baskets are available for pre-order. Orders placed on or after our launch date, December 15th, will begin shipping from January 15th, 2026. Thank you for your patience.
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
                                        src="https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523697/WICKER_BASKET_jy5cs6.jpg"
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
                                        src="https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761523728/BLACK_WICKER_BASKET_xhdnno.jpg"
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
                <div className="flex flex-col-reverse lg:flex-row min-h-[calc(100vh-5rem)] overflow-hidden pt-12 lg:pt-0">
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
                                    className="w-full pl-10 pr-4 py-3 border border-luxury-warm-grey/20 rounded-lg bg-white focus:outline-none focus:border-brand-purple/50 transition-colors duration-200 font-extralight"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-luxury-warm-grey/20 rounded-lg bg-white focus:outline-none focus:border-brand-purple/50 transition-colors duration-200 font-extralight"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="flex-2 overflow-y-auto overflow-x-hidden px-6 pb-6 max-h-[calc(100vh-100px)]">
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

                                    const handleItemClick = (e?: React.MouseEvent) => {
                                        if (e) {
                                            e.stopPropagation();
                                        }
                                        if (isSelected || !canAdd) {
                                            useToastStore.getState().addToast({
                                                type: "info",
                                                title: isSelected ? "Already Added" : "Selection Limit Reached",
                                                message: isSelected
                                                    ? "This product is already in your basket."
                                                    : `You can select up to ${MAX_SELECTION} products in your custom basket.`,
                                            });
                                            return;
                                        }
                                        // Set the selected product and its current variant for the modal
                                        setSelectedProduct(product);
                                        setModalVariantIndex(prev => ({
                                            ...prev,
                                            [product.id]: variantIndex
                                        }));
                                    };

                                    return (
                                        <motion.div
                                            key={product.id}
                                            whileHover={{ scale: canAdd ? 1.02 : 1 }}
                                            onClick={() => canAdd && handleItemClick()}
                                            className={` h-36 sm:h-40 p-4 border rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                                ? 'border-brand-purple/50 bg-brand-purple/5 cursor-default'
                                                : canAdd
                                                    ? 'border-luxury-warm-grey/20 hover:border-brand-purple/30 hover:bg-luxury-warm-grey/5'
                                                    : 'border-luxury-warm-grey/20 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 h-full">
                                                <div className="w-16 h-full rounded-lg overflow-hidden shrink-0 relative">
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
                                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                                    />

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
                                <BasketTotalPriceDisplay totalPrice={currentBasket.totalPrice + 60} />
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
                                                <div className="w-12 h-20 rounded-md overflow-hidden shrink-0 relative">
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

            {/* Product Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-white/60 backdrop-blur-md z-50"
                            onClick={() => setSelectedProduct(null)}
                        />

                        {/* Modal Card */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[calc(90vh-2px)] overflow-hidden flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header with Close Button */}
                                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-black/10 shrink-0">
                                    <h2 className="text-[15px] sm:text-[19px] font-extralight uppercase tracking-wide text-luxury-black">
                                        {selectedProduct.name}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="inline-flex items-center justify-center gap-1 text-black/60 hover:text-black transition-colors duration-200 cursor-pointer p-2"
                                    >
                                        <LuX size={18} />
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Main Content - Image smaller, text larger */}
                                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 p-6 min-h-full">
                                        {/* Left Panel - Full Height Product Image */}
                                        {(() => {
                                            const variants = selectedProduct.variants ?? [];
                                            const variantIdx = modalVariantIndex[selectedProduct.id] ?? 0;
                                            const hasVariants = variants.length > 1;
                                            const currentVariant = hasVariants
                                                ? variants[variantIdx] ?? variants[0]
                                                : getDefaultVariant(selectedProduct);
                                            const currentImage = currentVariant.image;

                                            return (
                                                <div className="relative flex items-start justify-center lg:sticky lg:top-6 lg:h-[calc(100vh-12rem)]">
                                                    <div className="relative w-full sm:max-w-[240px] min-h-[460px] sm:min-h-auto aspect-square lg:max-w-full lg:h-full lg:aspect-auto">
                                                        <Image
                                                            src={currentImage}
                                                            alt={selectedProduct.name}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                            sizes="240px"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Right Panel - Product Details with more space */}
                                        <div className="flex flex-col gap-6">
                                            {/* Product Category */}
                                            {selectedProduct.category && (
                                                <p className="text-black text-[15px] font-extralight uppercase">
                                                    {selectedProduct.category}
                                                </p>
                                            )}

                                            {/* Separator Line */}
                                            <div className="w-12 h-px bg-black"></div>

                                            {/* Variant Selector */}
                                            {(() => {
                                                const variants = selectedProduct.variants ?? [];
                                                const variantIdx = modalVariantIndex[selectedProduct.id] ?? 0;
                                                const hasVariants = variants.length > 1;

                                                if (!hasVariants) {
                                                    return (
                                                        <div>
                                                            <ProductPriceDisplay price={(variants[0] ?? getDefaultVariant(selectedProduct)).price} />
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="flex flex-col gap-3">
                                                        <label className="block text-[15px] font-extralight text-luxury-black uppercase">
                                                            Variant
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {variants.map((variant, index) => {
                                                                const isSelected = variantIdx === index;
                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => setModalVariantIndex(prev => ({
                                                                            ...prev,
                                                                            [selectedProduct.id]: index
                                                                        }))}
                                                                        className={`px-3 py-1.5 text-[13px] rounded transition-all duration-200 font-extralight uppercase ${isSelected
                                                                            ? 'bg-brand-purple text-white'
                                                                            : 'bg-white border border-black/20 text-luxury-black hover:border-brand-purple'
                                                                            }`}
                                                                    >
                                                                        {variant.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div>
                                                            <ProductPriceDisplay price={(variants[variantIdx] ?? variants[0]).price} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Description */}
                                            <div>
                                                <p
                                                    className="text-black/70 leading-relaxed font-extralight text-[15px]"
                                                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                                                />
                                            </div>

                                            {/* Add to Basket Button */}
                                            <button
                                                onClick={handleAddItem}
                                                className="flex items-center gap-2 text-luxury-black hover:text-brand-purple transition-colors duration-200 cursor-pointer w-fit py-2"
                                            >
                                                <span className="text-[13px] font-extralight tracking-wider uppercase">Add to Basket</span>
                                                <div className="w-5 h-5 border border-luxury-black rounded-full flex items-center justify-center">
                                                    <LuShoppingCart size={11} />
                                                </div>
                                            </button>

                                            {/* Detailed Information Section - Below Add to Basket Button */}
                                            {selectedProduct.details && (
                                                <div className="flex flex-col gap-4 border-t border-black/10 pt-6">
                                                    <h2 className="text-[13px] sm:text-[15px] font-extralight text-luxury-black uppercase">
                                                        Detailed Information
                                                    </h2>
                                                    <div>
                                                        {renderProductDetails(selectedProduct)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
