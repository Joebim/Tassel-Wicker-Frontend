import React from 'react';
import { LuChevronDown } from 'react-icons/lu';

interface SortDropdownProps {
    sortBy: string;
    onSortChange: (sortBy: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange }) => {
    const sortOptions = [
        { value: 'name', label: 'Name A-Z' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' },
        { value: 'featured', label: 'Featured First' },
    ];

    return (
        <div className="relative">
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <LuChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
    );
};

export default SortDropdown;
