'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpenIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
    children: React.ReactNode;
    dbId: string;
}

export default function Layout({ children, dbId }: LayoutProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(dbId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy database ID:', err);
        }
    };

    return (
        <div
            className={`
                min-h-screen bg-gray-50
                dark:bg-gray-900
            `}
        >
            {/* Navigation */}
            <nav
                className={`
                    border-b bg-white shadow-sm
                    dark:border-gray-700 dark:bg-gray-800
                `}
            >
                <div
                    className={`
                        mx-auto max-w-7xl px-4
                        sm:px-6
                        lg:px-8
                    `}
                >
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/" className="flex items-center">
                                    <BookOpenIcon
                                        className={`
                                            h-8 w-8 text-blue-600
                                            dark:text-blue-400
                                        `}
                                    />
                                    <span
                                        className={`
                                            ml-2 text-xl font-bold text-gray-900
                                            dark:text-white
                                        `}
                                    >
                                        Reading Tracker
                                    </span>
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Database ID Display and Copy */}
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`
                                        text-sm text-gray-500
                                        dark:text-gray-400
                                    `}
                                >
                                    Database ID:
                                </span>
                                <div
                                    className={`
                                        flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1
                                        dark:bg-gray-700
                                    `}
                                >
                                    <code
                                        className={`
                                            font-mono text-xs text-gray-700
                                            dark:text-gray-300
                                        `}
                                    >
                                        {dbId.slice(0, 8)}...{dbId.slice(-4)}
                                    </code>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`
                                            flex items-center rounded p-1 text-gray-500
                                            hover:bg-gray-200 hover:text-gray-700
                                            focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none
                                            dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-300
                                        `}
                                        title="Copy full database ID"
                                    >
                                        {copied ? (
                                            <CheckIcon
                                                className={`
                                                    h-4 w-4 text-green-600
                                                    dark:text-green-400
                                                `}
                                            />
                                        ) : (
                                            <ClipboardDocumentIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Theme Toggle */}
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main
                className={`
                    mx-auto max-w-7xl py-6
                    sm:px-6
                    lg:px-8
                `}
            >
                {children}
            </main>
        </div>
    );
}
