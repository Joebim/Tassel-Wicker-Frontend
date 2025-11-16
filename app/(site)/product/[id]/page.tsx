'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LuArrowLeft, LuArrowRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useInView, motion } from 'framer-motion';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import { useCartStore } from '@/store/cartStore';
import type { ProductDataItem, ProductDetails, ShopProduct, ShopProductItem } from '@/types/productData';
import { getDefaultVariant, getDefaultImage } from '@/utils/productHelpers';
import { shopProducts, getAllSubProducts } from '@/utils/productData';
import { usePrice } from '@/hooks/usePrice';

type DetailValue = string | string[] | { [key: string]: string } | undefined;

const renderRichText = (text?: string) =>
    text ? <span dangerouslySetInnerHTML={{ __html: text }} /> : null;

const isRecordDetail = (value: DetailValue): value is { [key: string]: string } =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const formatDetailValue = (value: DetailValue): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join(', ');
    if (isRecordDetail(value)) {
        return Object.values(value)
            .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
            .join(', ');
    }
    return undefined;
};

const asStringArray = (value: DetailValue): string[] | undefined =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : undefined;

const asFragranceNotes = (
    value: DetailValue
): NonNullable<ProductDetails['fragranceNotes']> | undefined => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as NonNullable<ProductDetails['fragranceNotes']>;
    }
    return undefined;
};

// Basket Item Component
const BasketItem: React.FC<{
    item: ShopProductItem;
    product: { name: string; category: string; price: number; description: string; image: string };
    productId: string;
    index: number;
}> = ({ item, productId, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.3 });

    return (
        <motion.div
            ref={ref}
            className="grid grid-cols-1 lg:grid-cols-2 min-h-screen"
            animate={{
                scale: isInView ? 1 : 0.8,
            }}
            transition={{
                duration: 0.7,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {/* Item Image */}
            <div className="bg-luxury-white relative flex items-center justify-center p-6 sm:p-12">
                <div className="relative w-full h-[450px] sm:h-[700px]">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover object-center"
                    />

                    {/* Vertical Text - Left */}
                    <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-luxury-charcoal text-sm font-extralight tracking-wider uppercase">
                        Item {index + 1}
                    </div>
                </div>
            </div>

            {/* Item Details */}
            <div className="p-6 sm:p-12 flex flex-col justify-center">
                <div className="max-w-md">
                    {/* Item Title */}
                    <h2 className="text-4xl font-extralight text-luxury-black mb-6 leading-tight uppercase">
                        {item.name}
                    </h2>

                    {/* Item Description */}
                    <div className="mb-6">
                        <p className="text-luxury-cool-grey leading-relaxed font-extralight">
                            {renderRichText(item.description)}
                        </p>
                    </div>

                    {/* Separator Line */}
                    <div className="w-12 h-px bg-brand-purple mb-6"></div>

                    {/* Learn More CTA */}
                    <Link
                        href={`/learn-more?productId=${productId}&itemId=${item.id || index}`}
                        className="flex items-center gap-3 text-luxury-black hover:text-brand-purple transition-colors duration-200 cursor-pointer"
                    >
                        <span className="text-sm font-extralight tracking-wider uppercase">View Details</span>
                        <div className="w-6 h-6 border border-luxury-black rounded-full flex items-center justify-center">
                            <LuArrowRight size={12} />
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default function ProductDetail() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;
    const { addItem } = useCartStore();

    // Find product by ID
    const product = useMemo(() => {
        const allProducts = [...shopProducts, ...getAllSubProducts()];
        return allProducts.find(p => p.id === productId) as (ShopProduct | ProductDataItem) | undefined;
    }, [productId]);

    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    // Get current variant
    const currentVariant = product?.variants && product.variants.length > 0
        ? product.variants[selectedVariantIndex]
        : getDefaultVariant(product || {} as ProductDataItem);

    // Format price with currency conversion
    const { formattedPrice } = usePrice(currentVariant.price);

    // Get all images from all variants for the slider
    const allImages = product?.variants && product.variants.length > 0
        ? product.variants.map(v => v.image)
        : product
            ? [getDefaultImage(product)]
            : [];

    // Update image index when variant changes
    useEffect(() => {
        if (product?.variants && product.variants.length > 0) {
            // Use setTimeout to avoid synchronous setState in effect
            const timer = setTimeout(() => {
                setCurrentImageIndex(selectedVariantIndex);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [selectedVariantIndex, product]);

    const handleVariantSelect = (index: number) => {
        setSelectedVariantIndex(index);
        setCurrentImageIndex(index);
    };

    const handleImageNavigation = (direction: 'prev' | 'next') => {
        let newIndex: number;

        if (direction === 'prev') {
            newIndex = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
        } else {
            newIndex = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
        }

        setCurrentImageIndex(newIndex);
        // Update variant index to match image
        if (product?.variants && product.variants.length > 0) {
            setSelectedVariantIndex(newIndex);
        }
    };

    const handleImageIndicatorClick = (index: number) => {
        setCurrentImageIndex(index);
        if (product?.variants && product.variants.length > 0) {
            setSelectedVariantIndex(index);
        }
    };

    const handleCategoryNavigate = useCallback(() => {
        if (!product?.category) return;
        router.push(`/search?category=${encodeURIComponent(product.category)}`);
    }, [product, router]);

    const productDetails: ProductDetails | undefined = (product as { details?: ProductDetails })?.details;

    const detailSections = useMemo(() => {
        if (!productDetails) return [];

        const {
            brand,
            ingredients,
            dimensions,
            weight,
            volume,
            netWeight,
            packageDimensions,
            size,
            pages,
            paper,
            material,
            materials,
            care,
            wax,
            storage,
            fragranceNotes,
            contents,
            alcoholContent,
            composition,
            temperatureRange,
            heatSource,
        } = productDetails;

        const sections = [] as Array<{ title: string; content: React.ReactNode; order: number }>;

        const brandText = formatDetailValue(brand);
        if (brandText) {
            sections.push({
                title: 'Brand',
                order: 0,
                content: <p className="text-luxury-cool-grey font-extralight">{brandText}</p>,
            });
        }

        const ingredientItems = asStringArray(ingredients);
        if (ingredientItems && ingredientItems.length > 0) {
            sections.push({
                title: 'Ingredients',
                order: 1,
                content: (
                    <ul className="space-y-2 text-luxury-cool-grey font-extralight">
                        {ingredientItems.map((ingredient, index) => (
                            <li key={index}>• {ingredient}</li>
                        ))}
                    </ul>
                ),
            });
        }

        const specificationEntries = [
            { label: 'Dimensions', value: formatDetailValue(dimensions) },
            { label: 'Weight', value: formatDetailValue(weight) },
            { label: 'Volume', value: formatDetailValue(volume) },
            { label: 'Net Weight', value: formatDetailValue(netWeight) },
            { label: 'Package Dimensions', value: formatDetailValue(packageDimensions) },
            { label: 'Size', value: formatDetailValue(size) },
            { label: 'Pages', value: formatDetailValue(pages) },
            { label: 'Paper', value: formatDetailValue(paper) },
            { label: 'Material', value: formatDetailValue(material) },
            { label: 'Care', value: formatDetailValue(care) },
            { label: 'Wax', value: formatDetailValue(wax) },
        ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value));

        const materialsList = asStringArray(materials);

        if (specificationEntries.length > 0 || (materialsList && materialsList.length > 0)) {
            sections.push({
                title: 'Specifications',
                order: 2,
                content: (
                    <div className="space-y-2 text-luxury-cool-grey font-extralight">
                        {specificationEntries.map(({ label, value }) => (
                            <p key={label}>
                                {label}: {value}
                            </p>
                        ))}
                        {materialsList && materialsList.length > 0 && (
                            <div>
                                <p className="uppercase text-xs tracking-[0.3em] text-luxury-charcoal mb-1">Materials</p>
                                <ul className="space-y-1">
                                    {materialsList.map((entry, index) => (
                                        <li key={index}>• {entry}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ),
            });
        }

        const storageText = formatDetailValue(storage);
        if (storageText) {
            sections.push({
                title: 'Storage',
                order: 3,
                content: <p className="text-luxury-cool-grey font-extralight leading-relaxed">{storageText}</p>,
            });
        }

        const fragranceNotesDetails = asFragranceNotes(fragranceNotes);
        if (
            fragranceNotesDetails &&
            (fragranceNotesDetails.top || fragranceNotesDetails.middle || fragranceNotesDetails.base)
        ) {
            sections.push({
                title: 'Fragrance Notes',
                order: 4,
                content: (
                    <div className="space-y-2 text-luxury-cool-grey font-extralight">
                        {fragranceNotesDetails.top && (
                            <p>
                                <span className="font-medium">Top:</span> {fragranceNotesDetails.top}
                            </p>
                        )}
                        {fragranceNotesDetails.middle && (
                            <p>
                                <span className="font-medium">Middle:</span> {fragranceNotesDetails.middle}
                            </p>
                        )}
                        {fragranceNotesDetails.base && (
                            <p>
                                <span className="font-medium">Base:</span> {fragranceNotesDetails.base}
                            </p>
                        )}
                    </div>
                ),
            });
        }

        const contentsList = asStringArray(contents);
        if (contentsList && contentsList.length > 0) {
            sections.push({
                title: 'Contents',
                order: 5,
                content: (
                    <ul className="space-y-2 text-luxury-cool-grey font-extralight">
                        {contentsList.map((entry, index) => (
                            <li key={index}>• {entry}</li>
                        ))}
                    </ul>
                ),
            });
        }

        const additionalEntries = [
            { label: 'Alcohol Content', value: formatDetailValue(alcoholContent) },
            { label: 'Composition', value: formatDetailValue(composition) },
            { label: 'Temperature Range', value: formatDetailValue(temperatureRange) },
            { label: 'Heat Source', value: formatDetailValue(heatSource) },
        ].filter((entry): entry is { label: string; value: string } => Boolean(entry.value));

        if (additionalEntries.length > 0) {
            sections.push({
                title: 'Additional Information',
                order: 6,
                content: (
                    <div className="space-y-2 text-luxury-cool-grey font-extralight">
                        {additionalEntries.map(({ label, value }) => (
                            <p key={label}>
                                {label}: {value}
                            </p>
                        ))}
                    </div>
                ),
            });
        }

        return sections.sort((a, b) => a.order - b.order);
    }, [productDetails]);

    const handleAddToCart = () => {
        if (!product) return;

        const hasVariants = 'variants' in product && product.variants && product.variants.length > 0;
        const variantSlug = hasVariants
            ? currentVariant.name.toLowerCase().replace(/\s+/g, '-')
            : '';
        const basketItems = 'items' in product && product.items && product.items.length > 0
            ? (product.items as ShopProductItem[]).map((item) => ({
                name: item.name,
                image: item.image,
                category: item.category
            }))
            : undefined;
        const baseImage = hasVariants
            ? currentVariant.image
            : (product as { image?: string }).image ?? currentVariant.image;

        addItem({
            id: hasVariants ? `${product.id}-${variantSlug}` : product.id,
            name: hasVariants && currentVariant.name !== 'Default'
                ? `${product.name} - ${currentVariant.name}`
                : product.name,
            price: currentVariant.price,
            image: baseImage,
            category: product.category,
            description: product.description,
            variantName: hasVariants ? currentVariant.name : undefined,
            basketItems
        });
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-extralight text-luxury-black mb-4 uppercase">Product Not Found</h1>
                    <Link href="/shop" className="text-brand-purple hover:text-brand-purple-light transition-colors font-extralight uppercase">
                        Return to Shop
                    </Link>
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
                    <span className="font-extralight uppercase">Back</span>
                </button>
            </div>

            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen gap-y-12 lg:gap-y-0">
                {/* Left Panel - Product Image with Carousel */}
                <div className="bg-luxury-cream-light relative flex items-center justify-center p-6 sm:p-10 lg:p-12">
                    <div className="relative w-full max-w-[600px]">
                        {/* Carousel Container */}
                        <div className="relative overflow-hidden rounded-lg">
                            {/* Carousel Track */}
                            <div className="relative h-[400px] sm:h-[600px] w-full overflow-hidden">
                                <motion.div
                                    className="flex h-full w-full"
                                    animate={{
                                        x: `-${currentImageIndex * 100}%`
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }}
                                >
                                    {allImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className="w-full h-full flex items-center justify-center shrink-0 relative"
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.name} - ${product.variants?.[index]?.name || 'Image ' + (index + 1)}`}
                                                width={600}
                                                height={600}
                                                className="h-full w-full object-cover"
                                                priority={index === 0}
                                            />
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Navigation Arrows - Always visible for better UX */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => handleImageNavigation('prev')}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 group"
                                        aria-label="Previous image"
                                    >
                                        <LuChevronLeft size={24} className="text-luxury-charcoal group-hover:text-brand-purple transition-colors" />
                                    </button>
                                    <button
                                        onClick={() => handleImageNavigation('next')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 group"
                                        aria-label="Next image"
                                    >
                                        <LuChevronRight size={24} className="text-luxury-charcoal group-hover:text-brand-purple transition-colors" />
                                    </button>
                                </>
                            )}

                            {/* Image Indicators - Dots at bottom */}
                            {allImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                    {allImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleImageIndicatorClick(index)}
                                            className={`rounded-full transition-all duration-300 ${index === currentImageIndex
                                                ? 'bg-brand-purple w-8 h-2'
                                                : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                                                }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Product Details */}
                <div className="px-6 sm:px-10 lg:pr-12 lg:pl-0 flex flex-col justify-center">
                    <div className="max-w-xl">
                        <ScrollTextAnimation
                            className="text-[36px] sm:text-5xl lg:text-6xl font-extralight text-luxury-black mb-8 leading-tight uppercase"
                            delay={0.2}
                            duration={1.2}
                        >
                            {String(product.name)}
                        </ScrollTextAnimation>

                        {/* Variant Selector - Thumbnail Images */}
                        {product.variants && product.variants.length > 1 && (
                            <div className="mb-6">
                                <label className="block text-sm font-extralight text-luxury-charcoal mb-3 uppercase">
                                    Select Variant
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleVariantSelect(index)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === selectedVariantIndex
                                                ? 'border-brand-purple shadow-lg scale-105'
                                                : 'border-luxury-warm-grey/20 hover:border-brand-purple/50'
                                                }`}
                                            aria-label={`Select ${variant.name} variant`}
                                        >
                                            <Image
                                                src={variant.image}
                                                alt={variant.name}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                            {/* Selection indicator overlay */}
                                            {index === selectedVariantIndex && (
                                                <div className="absolute inset-0 bg-brand-purple/10 flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-brand-purple rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Variant name overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-extralight uppercase py-1 px-2 text-center">
                                                {variant.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Type & Price */}
                        <div className="mb-8">
                            {product.category && (
                                <button
                                    type="button"
                                    onClick={handleCategoryNavigate}
                                    className="text-brand-purple text-xl font-extralight mb-2 uppercase transition-colors duration-200 hover:text-brand-purple/80 cursor-pointer"
                                >
                                    {product.category}
                                </button>
                            )}
                            <div className="text-luxury-black text-3xl font-extralight">
                                {formattedPrice}
                            </div>
                        </div>

                        {/* Separator Line */}
                        <div className="w-16 h-px bg-brand-purple mb-8"></div>

                        {/* Description */}
                        <div className="mb-8">
                            <p className="text-luxury-cool-grey leading-relaxed font-extralight">
                                {renderRichText(product.description)}
                            </p>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="border border-brand-purple text-brand-purple px-6 py-3 font-extralight uppercase hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200 mb-4"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Details Section */}
            {detailSections.length > 0 && (
                <section className="bg-white pb-24 pt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                            <h2 className="text-3xl font-extralight text-luxury-black uppercase tracking-[0.35em]">
                                Detailed Information
                            </h2>
                            <div className="mt-4 md:mt-0 w-16 h-1 bg-brand-purple" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {detailSections.map(({ title, content }) => (
                                <div
                                    key={title}
                                    className="border border-luxury-warm-grey/20 rounded-3xl p-8 bg-white/70 backdrop-blur-sm"
                                >
                                    <h3 className="text-lg font-extralight uppercase tracking-[0.25em] text-luxury-black mb-4">
                                        {title}
                                    </h3>
                                    {content}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Basket Contents Section */}
            {/* Note: items property is only on ProductWithItems, not ProductDataItem */}
            {/* This section is for basket products that contain items */}
            {('items' in product && Array.isArray(product.items) && product.items.length > 0) && (
                <div className="bg-white py-24">
                    <div className="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-center px-10 border-b border-brand-purple self-center ">
                            <h2 className="text-2xl font-extralight text-brand-purple uppercase mb-5">
                                In the Basket
                            </h2>
                        </div>


                        <div className="space-y-24">
                            {(product.items as Array<ShopProductItem>).map((item, index: number) => {
                                const currentVariant = getDefaultVariant(product);
                                return (
                                    <BasketItem
                                        key={index}
                                        item={item}
                                        product={{
                                            name: product.name,
                                            category: product.category,
                                            price: currentVariant.price,
                                            description: product.description,
                                            image: currentVariant.image
                                        }}
                                        productId={product.id}
                                        index={index}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
