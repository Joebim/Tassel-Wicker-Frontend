import React from 'react';
import { LuX, LuFilter } from 'react-icons/lu';

interface FilterState {
    category?: string;
    price?: string;
}

interface LuxuryFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onFilterChange: (filters: Partial<FilterState>) => void;
    categories?: string[];
    currentFilters?: Partial<FilterState>;
}

const LuxuryFilter: React.FC<LuxuryFilterProps> = ({
    isOpen,
    onClose,
    onFilterChange,
    categories = ['All'],
    currentFilters = {}
}) => {
    const category = currentFilters.category || 'All';
    const price = currentFilters.price || 'All';

    const priceRanges = ['All', 'Free', 'Under £200', '£200 - £500', 'Over £500'];

    const handleCategorySelect = (newCategory: string) => {
        onFilterChange({
            category: newCategory === 'All' ? undefined : newCategory,
            price: price === 'All' ? undefined : price
        });
    };

    const handlePriceSelect = (newPrice: string) => {
        onFilterChange({
            category: category === 'All' ? undefined : category,
            price: newPrice === 'All' ? undefined : newPrice
        });
    };

    const handleClearFilters = () => {
        onFilterChange({});
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg w-64 border border-luxury-warm-grey/20 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 sticky top-0 bg-white pb-2 z-10">
                    <LuFilter size={18} className="text-luxury-charcoal" />
                    <h3 className="text-lg font-extralight text-luxury-charcoal uppercase">Filters</h3>
                    <button
                        onClick={onClose}
                        className="ml-auto p-1 hover:bg-luxury-warm-grey/10 rounded transition-colors duration-200"
                    >
                        <LuX size={16} className="text-luxury-charcoal" />
                    </button>
                </div>

                {/* Category Filter */}
                <div className="mb-8">
                    <label className="block text-sm font-extralight text-luxury-charcoal mb-4 uppercase">
                        Category
                    </label>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 text-left font-extralight uppercase ${category === cat
                                    ? 'bg-brand-purple text-luxury-white'
                                    : 'bg-luxury-warm-grey/10 text-luxury-charcoal hover:bg-luxury-warm-grey/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Filter */}
                <div>
                    <label className="block text-sm font-extralight text-luxury-charcoal mb-4 uppercase">
                        Price Range
                    </label>
                    <div className="space-y-2">
                        {priceRanges.map((range) => (
                            <button
                                key={range}
                                onClick={() => handlePriceSelect(range)}
                                className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 text-left font-extralight uppercase ${price === range
                                    ? 'bg-brand-purple text-luxury-white'
                                    : 'bg-luxury-warm-grey/10 text-luxury-charcoal hover:bg-luxury-warm-grey/20'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Clear Filters Button */}
                {(category !== 'All' || price !== 'All') && (
                    <div className="mt-6 pt-6 border-t border-luxury-warm-grey/20">
                        <button
                            onClick={handleClearFilters}
                            className="w-full px-4 py-2 text-sm text-luxury-cool-grey hover:text-luxury-black font-extralight uppercase transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LuxuryFilter;
