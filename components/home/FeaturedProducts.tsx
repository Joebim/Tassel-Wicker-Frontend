'use client';

import React from 'react';
import Link from 'next/link';
import { LuArrowRight, LuHeart, LuShoppingBag } from 'react-icons/lu';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types/product';

// Mock data - replace with actual API call
const featuredProducts: Product[] = [
    {
        id: '1',
        name: 'Artisan Wicker Basket - Large',
        description: 'Handcrafted wicker basket perfect for storage and decoration',
        price: 89.99,
        originalPrice: 119.99,
        images: ['/images/products/basket-1.jpg'],
        category: 'Baskets',
        tags: ['handmade', 'storage', 'decorative'],
        inStock: true,
        stockQuantity: 10,
        featured: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: '2',
        name: 'Handwoven Storage Basket',
        description: 'Beautiful handwoven basket for all your storage needs',
        price: 65.99,
        images: ['/images/products/basket-2.jpg'],
        category: 'Baskets',
        tags: ['handmade', 'storage'],
        inStock: true,
        stockQuantity: 15,
        featured: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: '3',
        name: 'Vintage Style Wicker Tray',
        description: 'Elegant wicker tray for serving and decoration',
        price: 45.99,
        images: ['/images/products/basket-3.jpg'],
        category: 'Accessories',
        tags: ['decorative', 'serving'],
        inStock: true,
        stockQuantity: 20,
        featured: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
    {
        id: '4',
        name: 'Premium Wicker Hamper',
        description: 'Luxury wicker hamper for elegant storage',
        price: 125.99,
        images: ['/images/products/basket-4.jpg'],
        category: 'Baskets',
        tags: ['luxury', 'storage', 'hamper'],
        inStock: true,
        stockQuantity: 8,
        featured: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
    },
];

const FeaturedProducts: React.FC = () => {
    const { addItem } = useCart();

    const handleAddToCart = (product: Product) => {
        addItem(product, 1);
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                        Featured Collection
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover our signature wicker baskets, each crafted with care and designed
                        to bring elegance to your everyday life.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {featuredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200">
                                        <LuHeart size={16} className="text-gray-600" />
                                    </button>
                                </div>
                                {product.originalPrice && (
                                    <div className="absolute top-4 left-4 bg-amber-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Sale
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="mb-2">
                                    <span className="text-sm text-gray-500">{product.category}</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-amber-600 transition-colors duration-200">
                                    {product.name}
                                </h3>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-xl font-semibold text-gray-900">
                                        ${product.price}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-lg text-gray-500 line-through">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <LuShoppingBag size={16} />
                                        <span>Add to Cart</span>
                                    </button>
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-md transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                        <span>View All Products</span>
                        <LuArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
