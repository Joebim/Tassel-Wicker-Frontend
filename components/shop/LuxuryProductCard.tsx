'use client';

import React from 'react';
import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';
import type { ProductDataItem, ShopProduct } from '@/types/productData';
import { getDefaultImage, getDefaultPrice } from '@/utils/productHelpers';
import { usePrice } from '@/hooks/usePrice';

type CardProduct = ShopProduct | (ProductDataItem & {
        isNew?: boolean;
        isFeatured?: boolean;
        isCustom?: boolean;
});

interface LuxuryProductCardProps {
    product: CardProduct;
    onAddToCart?: (product: CardProduct) => void;
}

const LuxuryProductCard: React.FC<LuxuryProductCardProps> = ({ product, onAddToCart }) => {
    // Handle products with or without variants
    const defaultImage = 'variants' in product && product.variants && product.variants.length > 0
        ? getDefaultImage(product as ProductDataItem)
        : (product.image || '');
    const basePrice = 'variants' in product && product.variants && product.variants.length > 0
        ? getDefaultPrice(product as ProductDataItem)
        : (product.price || 0);
    
    // Use price hook for formatting
    const { formattedPrice } = usePrice(basePrice);
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product);
        }
    };
    const getProductLink = () => {
        if (product.isCustom) return '/build-your-basket';
        if (product.id === '4' && product.name === 'Branded Tote Bag') return '/product/tote-bag';
        return `/product/${product.id}`;
    };

    return (
        <Link
            href={getProductLink()}
            className="group block"
        >
            <div className="bg-luxury-white overflow-hidden transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-[400px] overflow-hidden">
                    <img
                        src={defaultImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Custom hover overlay for "Build Your Basket" */}
                    {product.isCustom && (
                        <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-luxury-black text-lg font-extralight uppercase mb-2">
                                    Start Building Your Basket
                                </div>
                                <LuArrowRight size={24} className="text-luxury-black mx-auto" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="pt-6 bg-luxury-white flex flex-col items-start justify-between">
                    <h3 className="text-lg font-extralight text-luxury-charcoal mb-2 group-hover:text-brand-purple transition-colors duration-200 uppercase">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between w-full">
                        {basePrice > 0 ? (
                            <span className="text-xl font-extralight text-luxury-black">
                                {formattedPrice}
                            </span>
                        ) : null}

                        {/* Add to Cart Button - Only appears on hover for non-custom products */}
                        {!product.isCustom && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex items-center gap-1 text-luxury-charcoal hover:text-brand-purple transition-colors duration-200 text-sm font-extralight uppercase"
                                >
                                    <span>Add to Cart</span>
                                    <LuArrowRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default LuxuryProductCard;
