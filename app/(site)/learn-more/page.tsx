'use client';

import { useCallback, useEffect, useMemo, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LuArrowLeft } from 'react-icons/lu';
import { getDefaultVariant } from '@/utils/productHelpers';
import type { ShopProductItem } from '@/types/productData';
import { backendProducts } from '@/services/backend';
import { toProductDataItem } from '@/utils/backendProductMapper';
import { useToastStore } from '@/store/toastStore';
import { PageContentSkeleton } from '@/components/common/SkeletonLoader';

function LearnMoreContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get('productId');
    const itemId = searchParams.get('itemId');

    const [item, setItem] = useState<ShopProductItem | null>(null);
    const [categoryLabel, setCategoryLabel] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;
        let alive = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await backendProducts.getProduct(productId, true);
                if (!alive) return;
                const linked = (res.linkedProducts || []).map((lp) => toProductDataItem(lp));
                let found = undefined as any;
                if (itemId) {
                    found = linked.find((x) => x.id === itemId);
                    if (!found && !isNaN(Number(itemId))) {
                        found = linked[Number(itemId)];
                    }
                }
                if (!found) {
                    setItem(null);
                    setCategoryLabel(undefined);
                    return;
                }
                const v = getDefaultVariant(found);
                const mappedItem: ShopProductItem = {
                    id: found.id,
                    name: found.name,
                    description: found.description,
                    image: v.image,
                    category: found.category,
                    variants: found.variants || [v],
                    details: (found as any).details,
                };
                setItem(mappedItem);
                setCategoryLabel(mappedItem.category);
            } catch (e) {
                useToastStore.getState().addToast({
                    type: 'error',
                    title: 'Failed to load item',
                    message: e instanceof Error ? e.message : 'Could not load item details.',
                });
                setItem(null);
                setCategoryLabel(undefined);
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        return () => { alive = false; };
    }, [productId, itemId]);

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
                {(details.dimensions || details.weight || details.volume || details.netWeight || details.packageDimensions || details.size || details.pages || details.paper || details.material || (details.materials && Array.isArray(details.materials) && details.materials.length > 0) || details.care || details.wax || details.quantity) && (
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
                                <div className="space-y-1">
                                    {details.materials.map((material: string, index: number) => (
                                        <p key={index} className="text-luxury-cool-grey font-extralight">
                                            • {material}
                                        </p>
                                    ))}
                                </div>
                            )}
                            {details.care && (
                                <p className="text-luxury-cool-grey font-extralight">Care: {String(details.care)}</p>
                            )}
                            {details.wax && (
                                <p className="text-luxury-cool-grey font-extralight">Wax: {String(details.wax)}</p>
                            )}
                            {details.quantity && (
                                <p className="text-luxury-cool-grey font-extralight">Quantity: {String(details.quantity)}</p>
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
                                    <span>Top:</span> {String(details.fragranceNotes.top)}
                                </p>
                            )}
                            {details.fragranceNotes.middle && (
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span>Middle:</span> {String(details.fragranceNotes.middle)}
                                </p>
                            )}
                            {details.fragranceNotes.base && (
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span>Base:</span> {String(details.fragranceNotes.base)}
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

    // Get the item image from its default variant (must be called before early return)
    const itemImage = useMemo(() => {
        if (!item) return '';
        const defaultVariant = getDefaultVariant(item);
        return defaultVariant.image;
    }, [item]);

    if (loading) {
        return <PageContentSkeleton />;
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
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

    return (
        <div className="min-h-screen bg-white text-luxury-black">
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
                <div className="bg-white relative flex items-center justify-center p-6  sm:p-12">
                    <div className="relative max-w-lg w-full  h-[530px] sm:h-[700px]">
                        <Image
                            src={itemImage}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />

                        {/* Decorative Elements */}
                        <div className="absolute -top-8 -left-8 w-16 h-16 border border-brand-purple/20 rounded-full"></div>
                        <div className="absolute -bottom-8 -right-8 w-12 h-12 border border-brand-purple/30 rounded-full"></div>
                    </div>
                </div>

                {/* Right Panel - Basic Product Details */}
                <div className="p-6 sm:p-12 flex flex-col justify-center">
                    <div className="max-w-2xl">
                        {/* Product Title */}
                        <h1 className="text-[36px] font-extralight text-luxury-black mb-8 leading-tight uppercase">
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
                            <p
                                className="text-luxury-cool-grey leading-relaxed font-extralight text-lg"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Detailed Information Section */}
            {item.details && (
                <div className="bg-white pb-6 sm:pb-24 pt-0 sm:pt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl font-extralight text-luxury-black mb-6 sm:mb-16 text-center uppercase">
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-luxury-cool-grey font-extralight">Loading...</div>
            </div>
        }>
            <LearnMoreContent />
        </Suspense>
    );
}
