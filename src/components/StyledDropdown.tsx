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
}

const getStatusColor = (status: BookStatus) => {
    switch (status) {
        case 'Read':
            return 'bg-green-100 text-green-800';
        case 'Reading':
            return 'bg-blue-100 text-blue-800';
        case 'TBR':
            return 'bg-yellow-100 text-yellow-800';
        case 'DNF':
            return 'bg-red-100 text-red-800';
        case 'On Hold':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusBadgeColor = (status: BookStatus) => {
    switch (status) {
        case 'Read':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Reading':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'TBR':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'DNF':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'On Hold':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
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
}: StyledDropdownProps) {
    const selectedOption = options.find((option) => option.value === value);

    // For status pill variant (book detail page)
    if (variant === 'status-pill' && isStatusDropdown) {
        return (
            <div className="relative inline-block">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                        inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                        ${getStatusColor(value as BookStatus)}
                        border-0 focus:ring-2 focus:ring-blue-500
                        appearance-none cursor-pointer pr-8
                        ${className}
                    `}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-current" />
            </div>
        );
    }

    // For compact variant (table cells)
    if (variant === 'compact') {
        if (isStatusDropdown && showColors) {
            return (
                <div className="relative">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`
                            inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
                            ${getStatusBadgeColor(value as BookStatus)}
                            border focus:ring-2 focus:ring-blue-500
                            appearance-none cursor-pointer pr-6 min-w-0
                            ${className}
                        `}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 pointer-events-none text-current" />
                </div>
            );
        } else {
            return (
                <div className="relative">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`
                            block w-full rounded-md border border-gray-300 px-2 py-1 text-xs
                            focus:border-blue-500 focus:ring-blue-500
                            appearance-none cursor-pointer pr-6
                            ${className}
                        `}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
            );
        }
    }

    // Default variant
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                    appearance-none cursor-pointer pr-10
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
            <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>
    );
}
