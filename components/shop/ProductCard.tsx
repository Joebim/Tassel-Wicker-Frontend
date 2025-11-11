'use client';

import React from 'react';
import Link from 'next/link';
import { LuHeart, LuShoppingBag } from 'react-icons/lu';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    viewMode: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem(product, 1);
    };

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="flex">
                    <div className="w-48 h-48 shrink-0">
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="mb-2">
                                    <span className="text-sm text-gray-500">{product.category}</span>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-2xl font-semibold text-gray-900">
                                        ${product.price}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-lg text-gray-500 line-through">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </p>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                                    <LuHeart size={16} className="text-gray-600" />
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors duration-200"
                                >
                                    <LuShoppingBag size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Link
                                href={`/product/${product.id}`}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200 text-center"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
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
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-md font-medium">
                            Out of Stock
                        </span>
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
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                        <LuShoppingBag size={16} />
                        <span>Add to Cart</span>
                    </button>
                    <Link
                        href={`/product/${product.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
