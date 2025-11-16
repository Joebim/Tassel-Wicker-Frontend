'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LuSearch, LuArrowLeft, LuX, LuFilter } from 'react-icons/lu';
import LuxuryProductCard from '@/components/shop/LuxuryProductCard';
import { useCartStore } from '@/store/cartStore';
import { getAllProducts, shopProducts } from '@/utils/productData';
import { getDefaultImage, getDefaultPrice } from '@/utils/productHelpers';
import type { ProductDataItem, ShopProduct } from '@/types/productData';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category') || 'All');
    const [selectedPrice, setSelectedPrice] = useState<string>('All');
    const { addItem } = useCartStore();

    const updateQueryParams = useCallback(
        (nextSearch: string, nextCategory: string) => {
            const params = new URLSearchParams();
            const trimmed = nextSearch.trim();
            if (trimmed) {
                params.set('search', trimmed);
            }
            if (nextCategory !== 'All') {
                params.set('category', nextCategory);
            }
            const queryString = params.toString();
            router.push(queryString ? `/search?${queryString}` : '/search');
        },
        [router]
    );

    const allProducts = getAllProducts();

    // Combine shop products with all products from productData
    const combinedProducts = useMemo(() => {
        // Use products directly - LuxuryProductCard now handles variants
        return [...shopProducts, ...allProducts];
    }, [allProducts]);

    // Get unique categories
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(combinedProducts.map(p => p.category)));
        return ['All', ...uniqueCategories];
    }, [combinedProducts]);

    const priceRanges = ['All', 'Free', 'Under $200', '$200 - $500', 'Over $500'];

    // Filter products based on search term and filters
    const filteredProducts = useMemo(() => {
        let filtered = combinedProducts;

        // Apply search term filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((product) => {
                const matchesName = product.name.toLowerCase().includes(term);
                const matchesDescription = product.description?.toLowerCase().includes(term);
                const matchesCategory = product.category?.toLowerCase().includes(term);
                return matchesName || matchesDescription || matchesCategory;
            });
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter((product) => product.category === selectedCategory);
        }

        // Apply price filter
        if (selectedPrice !== 'All') {
            filtered = filtered.filter((product) => {
                const price = 'variants' in product && product.variants && product.variants.length > 0
                    ? getDefaultPrice(product as ProductDataItem)
                    : product.price ?? 0;
                switch (selectedPrice) {
                    case 'Free':
                        return price === 0;
                    case 'Under $200':
                        return price > 0 && price < 200;
                    case '$200 - $500':
                        return price >= 200 && price <= 500;
                    case 'Over $500':
                        return price > 500;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [combinedProducts, searchTerm, selectedCategory, selectedPrice]);

    // Keep local state in sync with URL params when navigation occurs
    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        const urlCategory = searchParams.get('category');
        if (urlCategory && categories.includes(urlCategory)) {
            setSelectedCategory(urlCategory);
        } else if (!urlCategory) {
            setSelectedCategory('All');
        }
    }, [searchParams, categories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateQueryParams(searchTerm, selectedCategory);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        updateQueryParams('', selectedCategory);
    };

    const handleAddToCart = (product: ProductDataItem | ShopProduct) => {
        const defaultImage = 'variants' in product && product.variants && product.variants.length > 0
            ? getDefaultImage(product as ProductDataItem)
            : (product.image || '');
        const defaultPrice = 'variants' in product && product.variants && product.variants.length > 0
            ? getDefaultPrice(product as ProductDataItem)
            : (product.price || 0);
        const basketItems = 'items' in product && product.items && product.items.length > 0
            ? product.items.map((item) => ({
                name: item.name,
                image: item.image ?? getDefaultImage(item as ProductDataItem),
                category: item.category
            }))
            : undefined;
        addItem({
            id: product.id,
            name: product.name,
            price: defaultPrice,
            image: defaultImage,
            category: product.category,
            description: product.description || product.name,
            basketItems,
        });
    };

    const handleClearFilters = () => {
        setSelectedCategory('All');
        setSelectedPrice('All');
        updateQueryParams(searchTerm, 'All');
    };

    const hasActiveFilters = selectedCategory !== 'All' || selectedPrice !== 'All';

    return (
        <div className="min-h-screen bg-white pt-12">
            {/* Header Section */}
            <div className="bg-white border-b border-luxury-warm-grey/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-luxury-charcoal hover:text-brand-purple transition-colors duration-200 cursor-pointer"
                        >
                            <LuArrowLeft size={20} />
                            <span className="font-extralight uppercase tracking-wide">Back</span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <LuSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-cool-grey" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full pl-12 pr-12 py-4 border border-luxury-warm-grey/20 rounded-lg bg-white focus:outline-none focus:border-brand-purple/50 transition-colors duration-200 font-extralight text-luxury-black placeholder-luxury-cool-grey"
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-luxury-cool-grey hover:text-luxury-black transition-colors"
                                >
                                    <LuX size={20} />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Results Count */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-luxury-cool-grey font-extralight uppercase text-sm">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="text-luxury-cool-grey hover:text-luxury-black font-extralight uppercase text-sm transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content with Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="w-full lg:w-64 shrink-0 hidden lg:block">
                        <div className="bg-white border border-luxury-warm-grey/20 rounded-lg p-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            <div className="flex items-center gap-2 mb-6 sticky top-0 bg-white pb-2 z-10">
                                <LuFilter size={18} className="text-luxury-charcoal" />
                                <h3 className="text-lg font-extralight text-luxury-charcoal uppercase">Filters</h3>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-8">
                                <label className="block text-sm font-extralight text-luxury-charcoal mb-4 uppercase">
                                    Category
                                </label>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                updateQueryParams(searchTerm, category);
                                            }}
                                            className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 text-left font-extralight uppercase ${selectedCategory === category
                                                ? 'bg-brand-purple text-luxury-white'
                                                : 'bg-luxury-warm-grey/10 text-luxury-charcoal hover:bg-luxury-warm-grey/20'
                                                }`}
                                        >
                                            {category}
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
                                            onClick={() => setSelectedPrice(range)}
                                            className={`w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 text-left font-extralight uppercase ${selectedPrice === range
                                                ? 'bg-brand-green text-luxury-white'
                                                : 'bg-luxury-warm-grey/10 text-luxury-charcoal hover:bg-luxury-warm-grey/20'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <LuxuryProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        ) : searchTerm || hasActiveFilters ? (
                            <div className="text-center py-20">
                                <div className="mb-6">
                                    <LuSearch size={64} className="text-luxury-cool-grey mx-auto mb-4" />
                                </div>
                                <h2 className="text-2xl font-extralight text-luxury-black mb-4 uppercase">
                                    No products found
                                </h2>
                                <p className="text-luxury-cool-grey font-extralight mb-8">
                                    Try adjusting your search or filters
                                </p>
                                <div className="flex gap-4 justify-center">
                                    {searchTerm && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="border border-luxury-charcoal text-luxury-charcoal px-6 py-3 font-extralight uppercase hover:bg-luxury-charcoal hover:text-luxury-white transition-colors duration-200"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="border border-luxury-charcoal text-luxury-charcoal px-6 py-3 font-extralight uppercase hover:bg-luxury-charcoal hover:text-luxury-white transition-colors duration-200"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="mb-6">
                                    <LuSearch size={64} className="text-luxury-cool-grey mx-auto mb-4" />
                                </div>
                                <h2 className="text-2xl font-extralight text-luxury-black mb-4 uppercase">
                                    Start searching
                                </h2>
                                <p className="text-luxury-cool-grey font-extralight">
                                    Enter a search term to find products
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Search() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white pt-12 flex items-center justify-center">
                <div className="text-luxury-cool-grey font-extralight">Loading...</div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
