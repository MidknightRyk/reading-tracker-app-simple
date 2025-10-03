'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { BookStatus } from '@/types';

interface Option {
    value: string;
    label: string;
    color?: string;
}

interface StyledDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    showColors?: boolean;
    isStatusDropdown?: boolean;
    variant?: 'default' | 'status-pill' | 'compact';
    disabled?: boolean;
}

const getStatusColor = (status: BookStatus) => {
    switch (status) {
        case 'Read':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'Reading':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'TBR':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'DNF':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'On Hold':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

export default function StyledDropdown({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    className = '',
    showColors = false,
    isStatusDropdown = false,
    variant = 'default',
    disabled = false,
}: StyledDropdownProps) {
    const selectedOption = options.find((option) => option.value === value);

    // For status pill variant - colored pill button with native dropdown
    if (variant === 'status-pill' && isStatusDropdown) {
        if (disabled) {
            // Read-only display pill
            return (
                <span
                    className={`
                        inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                        ${getStatusColor(value as BookStatus)}
                        ${className}
                    `}
                >
                    {selectedOption?.label || placeholder}
                </span>
            );
        }

        // Interactive dropdown with colored pill styling
        return (
            <div className="relative inline-block">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                        cursor-pointer appearance-none rounded-full px-3 py-1 pr-8 text-sm font-medium
                        ${getStatusColor(value as BookStatus)}
                        border-0 transition-all duration-150
                        focus:ring-2 focus:ring-blue-500 focus:outline-none
                        dark:focus:ring-blue-400
                        ${className}
                    `}
                    style={{
                        backgroundImage: 'none',
                    }}
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className={`
                                bg-white text-black
                                dark:bg-gray-800 dark:text-white
                            `}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon
                    className={`pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-current`}
                />
            </div>
        );
    }

    // For compact variant (table cells)
    if (variant === 'compact') {
        return (
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                        block w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-2 py-1 pr-6
                        text-xs transition-all duration-150
                        focus:border-blue-500 focus:ring-blue-500
                        dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400
                        dark:focus:ring-blue-400
                        ${className}
                    `}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon
                    className={`
                        pointer-events-none absolute top-1/2 right-1 h-3 w-3 -translate-y-1/2 text-gray-500
                        dark:text-gray-400
                    `}
                />
            </div>
        );
    }

    // Default variant
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    block w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10
                    shadow-sm transition-all duration-150
                    focus:border-blue-500 focus:ring-blue-500
                    sm:text-sm
                    dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400
                    dark:focus:ring-blue-400
                    ${className}
                `}
            >
                {!value && placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDownIcon
                className={`
                    pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500
                    dark:text-gray-400
                `}
            />
        </div>
    );
}
