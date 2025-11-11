'use client';

import { useCallback, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { useCustomBasketStore, type CustomBasketItem } from '@/store/customBasketStore';
import { useToastStore } from '@/store/toastStore';
import { getDefaultVariant } from '@/utils/productHelpers';
import { shopProducts } from '@/utils/productData';
import type { ShopProduct, ShopProductItem } from '@/types/productData';

function LearnMoreContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get('productId');
    const itemId = searchParams.get('itemId');
    
    const { currentBasket, addItem: addCustomBasketItem, queueItem } = useCustomBasketStore();
    const addToast = useToastStore((state) => state.addToast);

    // Find product and item from query parameters
    const { product, item } = useMemo(() => {
        if (!productId) return { product: undefined, item: undefined };
        
        const foundProduct = shopProducts.find(p => p.id === productId) as ShopProduct | undefined;
        if (!foundProduct || !foundProduct.items) return { product: foundProduct, item: undefined };
        
        // Find item by ID or index
        let foundItem: ShopProductItem | undefined;
        if (itemId) {
            // Try to find by ID first
            foundItem = foundProduct.items.find(i => i.id === itemId);
            // If not found, try by index
            if (!foundItem && !isNaN(Number(itemId))) {
                foundItem = foundProduct.items[Number(itemId)];
            }
        }
        
        return { product: foundProduct, item: foundItem };
    }, [productId, itemId]);

    const categoryLabel = item?.category || product?.category;

    const handleCategoryNavigate = useCallback(() => {
        if (!categoryLabel) return;
        router.push(`/search?category=${encodeURIComponent(categoryLabel)}`);
    }, [categoryLabel, router]);

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const handleAddToCustomBasket = useCallback(() => {
        if (!item) {
            addToast({
                type: 'info',
                title: 'Product Details Unavailable',
                message: 'Please select a product to add to your custom basket.',
            });
            return;
        }

        const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const defaultVariant = getDefaultVariant(item);
        const hasCustomVariantName = defaultVariant.name && defaultVariant.name !== 'Default';
        const baseId = (typeof item.id === 'string' && item.id.trim() !== '')
            ? item.id
            : slugify(item.name) || slugify(defaultVariant.name || '') || 'custom-item';
        const variantSlug = hasCustomVariantName ? slugify(defaultVariant.name) : '';
        const uniqueId = variantSlug ? `${baseId}-${variantSlug}` : baseId;

        const basketItem: CustomBasketItem = {
            id: uniqueId,
            name: hasCustomVariantName ? `${item.name} - ${defaultVariant.name}` : item.name,
            description: item.description,
            image: defaultVariant.image,
            price: defaultVariant.price,
            category: item.category,
            variantName: hasCustomVariantName ? defaultVariant.name : undefined,
            details: item.details,
        };

        if (currentBasket) {
            const isDuplicate = currentBasket.selectedItems.some((selected) => selected.id === basketItem.id);
            if (isDuplicate) {
                addToast({
                    type: 'info',
                    title: 'Already Added',
                    message: 'This item is already in your custom basket.',
                });
                router.push('/build-your-basket');
                return;
            }

            if (currentBasket.selectedItems.length >= 5) {
                addToast({
                    type: 'warning',
                    title: 'Basket Full',
                    message: 'Remove an item before adding another to your custom basket.',
                });
                router.push('/build-your-basket');
                return;
            }

            addCustomBasketItem(basketItem);
            addToast({
                type: 'success',
                title: 'Added to Basket',
                message: 'We\'ve added this item to your custom basket.',
            });
            router.push('/build-your-basket');
            return;
        }

        queueItem(basketItem);
        addToast({
            type: 'info',
            title: 'Select Your Basket',
            message: 'Choose your basket style to add this item.',
        });
        router.push('/build-your-basket');
    }, [item, currentBasket, addCustomBasketItem, queueItem, addToast, router]);

    const renderDetails = () => {
        if (!item?.details) return null;

        const { details } = item;

        return (
            <div className="space-y-8">
                {details.brand && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-2 uppercase">Brand</h3>
                        <p className="text-luxury-cool-grey font-extralight">{String(details.brand)}</p>
                    </div>
                )}

                {details.ingredients && Array.isArray(details.ingredients) && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-3 uppercase">Ingredients</h3>
                        <div className="space-y-1">
                            {details.ingredients.map((ingredient: string, index: number) => (
                                <p key={index} className="text-luxury-cool-grey font-extralight">• {ingredient}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Specifications */}
                {(details.dimensions || details.weight || details.volume || details.netWeight || details.packageDimensions || details.size || details.pages || details.paper || details.material || (details.materials && Array.isArray(details.materials) && details.materials.length > 0) || details.care || details.wax) && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-3 uppercase">Specifications</h3>
                        <div className="space-y-2">
                            {details.dimensions && (
                                <p className="text-luxury-cool-grey font-extralight">Dimensions: {String(details.dimensions)}</p>
                            )}
                            {details.weight && (
                                <p className="text-luxury-cool-grey font-extralight">Weight: {String(details.weight)}</p>
                            )}
                            {details.volume && (
                                <p className="text-luxury-cool-grey font-extralight">Volume: {String(details.volume)}</p>
                            )}
                            {details.netWeight && (
                                <p className="text-luxury-cool-grey font-extralight">Net Weight: {String(details.netWeight)}</p>
                            )}
                            {details.packageDimensions && (
                                <p className="text-luxury-cool-grey font-extralight">Package Dimensions: {String(details.packageDimensions)}</p>
                            )}
                            {details.size && (
                                <p className="text-luxury-cool-grey font-extralight">Size: {String(details.size)}</p>
                            )}
                            {details.pages && (
                                <p className="text-luxury-cool-grey font-extralight">Pages: {String(details.pages)}</p>
                            )}
                            {details.paper && (
                                <p className="text-luxury-cool-grey font-extralight">Paper: {String(details.paper)}</p>
                            )}
                            {details.material && (
                                <p className="text-luxury-cool-grey font-extralight">Material: {String(details.material)}</p>
                            )}
                            {details.materials && Array.isArray(details.materials) && details.materials.length > 0 && (
                                <div className="text-luxury-cool-grey font-extralight">
                                    <p className="font-medium uppercase tracking-wide text-xs mb-1">Materials</p>
                                    <div className="space-y-1">
                                        {details.materials.map((material: string, index: number) => (
                                            <p key={index}>• {material}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {details.care && (
                                <p className="text-luxury-cool-grey font-extralight">Care: {String(details.care)}</p>
                            )}
                            {details.wax && (
                                <p className="text-luxury-cool-grey font-extralight">Wax: {String(details.wax)}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Storage */}
                {details.storage && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-3 uppercase">Storage</h3>
                        <p className="text-luxury-cool-grey font-extralight">{String(details.storage)}</p>
                    </div>
                )}

                {/* Fragrance Notes */}
                {details.fragranceNotes && typeof details.fragranceNotes === 'object' && !Array.isArray(details.fragranceNotes) && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-3 uppercase">Fragrance Notes</h3>
                        <div className="space-y-2">
                            {details.fragranceNotes.top && (
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span className="font-medium">Top:</span> {String(details.fragranceNotes.top)}
                                </p>
                            )}
                            {details.fragranceNotes.middle && (
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span className="font-medium">Middle:</span> {String(details.fragranceNotes.middle)}
                                </p>
                            )}
                            {details.fragranceNotes.base && (
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span className="font-medium">Base:</span> {String(details.fragranceNotes.base)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Contents */}
                {details.contents && Array.isArray(details.contents) && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-3 uppercase">Contents</h3>
                        <div className="space-y-1">
                            {details.contents.map((content: string, index: number) => (
                                <p key={index} className="text-luxury-cool-grey font-extralight">• {content}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                {(details.alcoholContent || details.composition || details.temperatureRange || details.heatSource) && (
                    <div className="border-l-2 border-brand-purple pl-6">
                        <h3 className="text-lg font-extralight text-luxury-black mb-3 uppercase">Additional Information</h3>
                        <div className="space-y-2">
                            {details.alcoholContent && (
                                <p className="text-luxury-cool-grey font-extralight">Alcohol Content: {String(details.alcoholContent)}</p>
                            )}
                            {details.composition && (
                                <p className="text-luxury-cool-grey font-extralight">Composition: {String(details.composition)}</p>
                            )}
                            {details.temperatureRange && (
                                <p className="text-luxury-cool-grey font-extralight">Temperature Range: {String(details.temperatureRange)}</p>
                            )}
                            {details.heatSource && (
                                <p className="text-luxury-cool-grey font-extralight">Heat Source: {String(details.heatSource)}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!product || !item) {
        return (
            <div className="min-h-screen bg-luxury-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-extralight text-luxury-black mb-4 uppercase">Product Not Found</h1>
                    <button
                        onClick={() => router.push('/shop')}
                        className="text-brand-purple hover:text-brand-purple-light transition-colors font-extralight uppercase"
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    // Get the item image from its default variant
    const itemImage = useMemo(() => {
        const defaultVariant = getDefaultVariant(item);
        return defaultVariant.image;
    }, [item]);

    return (
        <div className="min-h-screen bg-luxury-white text-luxury-black">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200 cursor-pointer"
                >
                    <LuArrowLeft size={16} />
                    <span className="font-extralight uppercase">Back to Product</span>
                </button>
            </div>

            {/* Main Content - Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Panel - Product Image */}
                <div className="bg-luxury-cream-light relative flex items-center justify-center p-12">
                    <div className="relative max-w-lg w-full h-[600px]">
                        <Image
                            src={itemImage}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />

                        {/* Decorative Elements */}
                        <div className="absolute -top-8 -left-8 w-16 h-16 border border-brand-purple/20 rounded-full"></div>
                        <div className="absolute -bottom-8 -right-8 w-12 h-12 border border-brand-purple/30 rounded-full"></div>
                    </div>
                </div>

                {/* Right Panel - Basic Product Details */}
                <div className="p-12 flex flex-col justify-center">
                    <div className="max-w-2xl">
                        {/* Product Title */}
                        <h1 className="text-4xl font-extralight text-luxury-black mb-8 leading-tight uppercase">
                            {item.name}
                        </h1>

                        {/* Product Category */}
                        {categoryLabel && (
                            <button
                                type="button"
                                onClick={handleCategoryNavigate}
                                className="text-brand-purple text-xl font-extralight mb-8 uppercase transition-colors duration-200 hover:text-brand-purple/80 cursor-pointer"
                            >
                                {categoryLabel}
                            </button>
                        )}

                        {/* Separator Line */}
                        <div className="w-16 h-px bg-brand-purple mb-8"></div>

                        {/* Description */}
                        <div className="mb-12">
                            <p className="text-luxury-cool-grey leading-relaxed font-extralight text-lg">
                                {item.description}
                            </p>
                        </div>

                        {/* CTA */}
                        <button
                            type="button"
                            onClick={handleAddToCustomBasket}
                            className="flex items-center gap-3 text-luxury-black hover:text-brand-purple transition-colors duration-200 cursor-pointer"
                        >
                            <span className="text-sm font-extralight tracking-wider uppercase">Add to Basket</span>
                            <div className="w-6 h-6 border border-luxury-black rounded-full flex items-center justify-center">
                                <LuArrowRight size={12} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Information Section */}
            {item.details && (
                <div className="bg-luxury-white pb-24 pt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extralight text-luxury-black mb-16 text-center uppercase">
                            Detailed Information
                        </h2>
                        <div className="max-w-4xl mx-auto">
                            {renderDetails()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LearnMore() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-luxury-white flex items-center justify-center">
                <div className="text-luxury-cool-grey font-extralight">Loading...</div>
            </div>
        }>
            <LearnMoreContent />
        </Suspense>
    );
}
