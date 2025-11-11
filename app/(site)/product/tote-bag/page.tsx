'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuArrowLeft } from 'react-icons/lu';
import { useCartStore } from '@/store/cartStore';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import { usePrice } from '@/hooks/usePrice';

export default function ToteBagDetail() {
    const router = useRouter();
    const { addItem } = useCartStore();

    const product = {
        id: '4',
        name: 'Branded Tote Bag',
        price: 120,
        image: 'https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761525451/BRANDED_TOTE_BAG_jno028.jpg',
        category: 'Accessories',
        description: 'Made from recycled cotton and polyester, this unisex, lightweight and durable bag is built for everyday use. Its simple, timeless design makes it a practical and sustainable choice.',
        details: {
            composition: '80% recycled cotton, 20% recycled polyester canvas',
            dimensions: '37 x 49 x 14cm',
            size: 'One size',
            weight: '300 GSM'
        }
    };
    
    // Format price with currency conversion
    const { formattedPrice } = usePrice(product.price);

    // Scroll to top when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description
        });
    };

    return (
        <div className="min-h-screen bg-luxury-white text-luxury-black">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <button
                    onClick={() => router.push('/shop')}
                    className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-luxury-black transition-colors duration-200"
                >
                    <LuArrowLeft size={16} />
                    <span className="font-extralight uppercase">Back to Shop</span>
                </button>
            </div>

            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Panel - Product Image */}
                <div className="bg-luxury-cream-light relative flex items-center justify-center p-12">
                    <div className="relative">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="max-w-full max-h-[600px] object-contain"
                        />
                    </div>
                </div>

                {/* Right Panel - Product Details */}
                <div className="pr-12 flex flex-col justify-center">
                    <div className="max-w-md">
                        <ScrollTextAnimation
                            className="text-6xl font-extralight text-luxury-black mb-8 leading-tight uppercase"
                            delay={0.2}
                            duration={1.2}
                        >{product.name}</ScrollTextAnimation>

                        {/* Product Type & Price */}
                        <div className="mb-8">
                            <div className="text-luxury-charcoal text-xl font-extralight mb-2 uppercase">
                                {product.category}
                            </div>
                            <div className="text-luxury-black text-3xl font-extralight">
                                {formattedPrice}
                            </div>
                        </div>

                        {/* Separator Line */}
                        <div className="w-16 h-px bg-luxury-charcoal mb-8"></div>

                        {/* Description */}
                        <div className="mb-8">
                            <p className="text-luxury-cool-grey leading-relaxed font-extralight">
                                {product.description}
                            </p>
                        </div>

                        {/* Composition Section */}
                        <div className="mb-8">
                            <h2 className="text-luxury-black text-xl font-extralight mb-4 uppercase">
                                Composition
                            </h2>
                            <p className="text-luxury-cool-grey leading-relaxed font-extralight">
                                {product.details.composition}
                            </p>
                        </div>

                        {/* Separator Line */}
                        <div className="w-16 h-px bg-luxury-charcoal mb-8"></div>

                        {/* Dimensions Section */}
                        <div className="mb-8">
                            <h2 className="text-luxury-black text-xl font-extralight mb-4 uppercase">
                                Dimensions
                            </h2>
                            <div className="space-y-2">
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span className="font-medium">Size:</span> {product.details.size}
                                </p>
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span className="font-medium">Dimensions:</span> {product.details.dimensions}
                                </p>
                                <p className="text-luxury-cool-grey font-extralight">
                                    <span className="font-medium">Weight:</span> {product.details.weight}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="border border-luxury-charcoal text-luxury-charcoal px-6 py-3 font-extralight uppercase hover:bg-luxury-charcoal hover:text-luxury-white transition-colors duration-200 mb-4"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
