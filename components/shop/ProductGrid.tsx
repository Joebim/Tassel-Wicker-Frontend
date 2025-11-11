import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product';

interface ProductGridProps {
    filters: {
        category?: string;
        priceRange: { min: number; max: number };
        inStock?: boolean;
        search?: string;
    };
    sortBy: string;
    viewMode: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ filters, sortBy, viewMode }) => {
    // Mock products data - replace with actual API call
    const products: Product[] = [
        {
            id: '1',
            name: 'Artisan Wicker Basket - Large',
            description: 'A beautifully crafted large wicker basket perfect for storage and decoration.',
            price: 89.99,
            originalPrice: 119.99,
            images: ['/images/products/basket-1.jpg'],
            category: 'Baskets',
            tags: ['handmade', 'storage', 'decorative'],
            inStock: true,
            stockQuantity: 10,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'Handwoven Storage Basket',
            description: 'A versatile storage basket with traditional weaving techniques.',
            price: 65.99,
            images: ['/images/products/basket-2.jpg'],
            category: 'Baskets',
            tags: ['storage', 'traditional'],
            inStock: true,
            stockQuantity: 15,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            name: 'Vintage Style Wicker Tray',
            description: 'An elegant wicker tray perfect for serving or display.',
            price: 45.99,
            images: ['/images/products/basket-3.jpg'],
            category: 'Accessories',
            tags: ['tray', 'serving', 'vintage'],
            inStock: true,
            stockQuantity: 8,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '4',
            name: 'Premium Wicker Hamper',
            description: 'A premium quality wicker hamper for laundry or storage.',
            price: 125.99,
            images: ['/images/products/basket-4.jpg'],
            category: 'Baskets',
            tags: ['hamper', 'premium', 'laundry'],
            inStock: true,
            stockQuantity: 5,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '5',
            name: 'Decorative Wicker Bowl',
            description: 'A decorative wicker bowl perfect for centerpieces or storage.',
            price: 35.99,
            images: ['/images/products/basket-5.jpg'],
            category: 'Accessories',
            tags: ['bowl', 'decorative', 'centerpiece'],
            inStock: false,
            stockQuantity: 0,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '6',
            name: 'Luxury Wicker Picnic Basket',
            description: 'A luxury picnic basket with all the essentials for outdoor dining.',
            price: 155.99,
            images: ['/images/products/basket-6.jpg'],
            category: 'Baskets',
            tags: ['picnic', 'luxury', 'outdoor'],
            inStock: true,
            stockQuantity: 3,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    const filteredProducts = products.filter(product => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.inStock && !product.inStock) return false;
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) return false;
        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'newest':
                return b.featured ? 1 : -1;
            default:
                return 0;
        }
    });

    return (
        <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
            }`}>
            {sortedProducts.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
