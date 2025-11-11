import React from 'react';
import { LuX } from 'react-icons/lu';

interface ProductFiltersProps {
    filters: {
        category: string;
        priceRange: { min: number; max: number };
        inStock: boolean;
        search: string;
    };
    onFiltersChange: (filters: ProductFiltersProps['filters']) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFiltersChange }) => {
    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'Baskets', label: 'Baskets' },
        { value: 'Accessories', label: 'Accessories' },
        { value: 'Storage', label: 'Storage' },
        { value: 'Decorative', label: 'Decorative' },
    ];

    const handleCategoryChange = (category: string) => {
        onFiltersChange({ ...filters, category });
    };

    const handlePriceRangeChange = (field: 'min' | 'max', value: number) => {
        onFiltersChange({
            ...filters,
            priceRange: { ...filters.priceRange, [field]: value },
        });
    };

    const handleInStockChange = (inStock: boolean) => {
        onFiltersChange({ ...filters, inStock });
    };

    const handleSearchChange = (search: string) => {
        onFiltersChange({ ...filters, search });
    };

    const clearFilters = () => {
        onFiltersChange({
            category: '',
            priceRange: { min: 0, max: 1000 },
            inStock: false,
            search: '',
        });
    };

    const hasActiveFilters = filters.category || filters.inStock || filters.search ||
        filters.priceRange.min > 0 || filters.priceRange.max < 1000;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                    >
                        <LuX size={14} />
                        <span>Clear All</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                </label>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
            </div>

            {/* Category */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                </label>
                <select
                    value={filters.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                </label>
                <div className="flex space-x-2">
                    <input
                        type="number"
                        value={filters.priceRange.min}
                        onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                        placeholder="Min"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                        type="number"
                        value={filters.priceRange.max}
                        onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                        placeholder="Max"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* In Stock Only */}
            <div className="mb-6">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleInStockChange(e.target.checked)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
            </div>

            {/* Quick Price Filters */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Filters
                </label>
                <div className="space-y-2">
                    <button
                        onClick={() => onFiltersChange({ ...filters, priceRange: { min: 0, max: 50 } })}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        Under $50
                    </button>
                    <button
                        onClick={() => onFiltersChange({ ...filters, priceRange: { min: 50, max: 100 } })}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        $50 - $100
                    </button>
                    <button
                        onClick={() => onFiltersChange({ ...filters, priceRange: { min: 100, max: 200 } })}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        $100 - $200
                    </button>
                    <button
                        onClick={() => onFiltersChange({ ...filters, priceRange: { min: 200, max: 1000 } })}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        Over $200
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
