'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
                rounded-md p-2 text-gray-500
                hover:bg-gray-100 hover:text-gray-700
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none
                dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300
            `}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>
    );
}
