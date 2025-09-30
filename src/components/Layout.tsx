'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HomeIcon, BookOpenIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

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
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="border-b bg-white shadow-sm">
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
                                    <BookOpenIcon className="h-8 w-8 text-blue-600" />
                                    <span className="ml-2 text-xl font-bold text-gray-900">Reading Tracker</span>
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Database ID Display and Copy */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Database ID:</span>
                                <div className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1">
                                    <code className="text-xs font-mono text-gray-700">
                                        {dbId.slice(0, 8)}...{dbId.slice(-4)}
                                    </code>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                        title="Copy full database ID"
                                    >
                                        {copied ? (
                                            <CheckIcon className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ClipboardDocumentIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
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
