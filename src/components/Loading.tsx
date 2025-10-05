'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Loading({ message = 'Loading...', size = 'md', className = '' }: LoadingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div
            className={`
                flex flex-col items-center justify-center py-8
                ${className}
            `}
        >
            <ArrowPathIcon
                className={`
                    ${sizeClasses[size]}
                    animate-spin text-blue-500
                    dark:text-blue-400
                `}
            />
            <p
                className={`
                    mt-2
                    ${textSizeClasses[size]}
                    text-gray-600
                    dark:text-gray-400
                `}
            >
                {message}
            </p>
        </div>
    );
}
