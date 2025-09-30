'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dataService } from '@/services/dataService';
import { BookOpenIcon, PlusIcon, ArrowRightIcon, ClipboardDocumentIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function Home() {
    const router = useRouter();
    const [existingDbId, setExistingDbId] = useState('');
    const [customDbId, setCustomDbId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateNew = async () => {
        setIsLoading(true);
        setError('');
        try {
            const dbId = dataService.createNewDatabase();
            router.push(`/${dbId}`);
        } catch (err) {
            setError('Failed to create new database. Please try again.');
            setIsLoading(false);
        }
    };

    const handleCreateCustom = async () => {
        if (!customDbId.trim()) {
            setError('Please enter a custom database ID');
            return;
        }

        // Validate custom ID format (letters, numbers, hyphens, underscores only)
        const validIdPattern = /^[a-zA-Z0-9-_]+$/;
        if (!validIdPattern.test(customDbId.trim())) {
            setError('Database ID can only contain letters, numbers, hyphens, and underscores');
            return;
        }

        if (customDbId.trim().length < 3) {
            setError('Database ID must be at least 3 characters long');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const success = dataService.createDatabaseWithId(customDbId.trim());
            if (success) {
                router.push(`/${customDbId.trim()}`);
            } else {
                setError('A database with this ID already exists. Please choose a different ID.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Failed to create database. Please try again.');
            setIsLoading(false);
        }
    };

    const handleUseExisting = () => {
        if (!existingDbId.trim()) {
            setError('Please enter a database ID');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Try to load the existing database
            const dbExists = dataService.databaseExists(existingDbId.trim());
            if (dbExists) {
                router.push(`/${existingDbId.trim()}`);
            } else {
                setError('Database ID not found. Please check the ID or create a new database.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Invalid database ID format. Please check and try again.');
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent, action: 'existing' | 'custom') => {
        if (e.key === 'Enter') {
            if (action === 'existing') {
                handleUseExisting();
            } else {
                handleCreateCustom();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <BookOpenIcon className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Reading Tracker</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Organize your books and track your reading progress
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Create New Database */}
                        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Start Fresh</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Create a new reading tracker with a randomly generated unique ID
                            </p>
                            <button
                                onClick={handleCreateNew}
                                disabled={isLoading}
                                className="mt-4 flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Create New Database
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Create Custom Database */}
                        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Create Custom Database</h2>
                            <p className="mt-2 text-sm text-gray-600">Create a new database with your own custom ID</p>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label htmlFor="customDbId" className="block text-sm font-medium text-gray-700">
                                        Custom Database ID
                                    </label>
                                    <input
                                        type="text"
                                        id="customDbId"
                                        value={customDbId}
                                        onChange={(e) => setCustomDbId(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, 'custom')}
                                        placeholder="my-reading-tracker"
                                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Only letters, numbers, hyphens, and underscores allowed. Minimum 3 characters.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCreateCustom}
                                    disabled={isLoading || !customDbId.trim()}
                                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <KeyIcon className="mr-2 h-4 w-4" />
                                            Create Custom Database
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-gray-50 px-2 text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Use Existing Database */}
                        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Continue Reading</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Enter your existing database ID to access your books
                            </p>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label htmlFor="dbId" className="block text-sm font-medium text-gray-700">
                                        Database ID
                                    </label>
                                    <input
                                        type="text"
                                        id="dbId"
                                        value={existingDbId}
                                        onChange={(e) => setExistingDbId(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, 'existing')}
                                        placeholder="Enter your database ID"
                                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleUseExisting}
                                    disabled={isLoading || !existingDbId.trim()}
                                    className="flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRightIcon className="mr-2 h-4 w-4" />
                                            Access Database
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ClipboardDocumentIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Keep Your Database ID Safe</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Your database ID is your unique link to access your reading tracker. Save it
                                        somewhere safe or bookmark the URL once you're redirected. You can always copy
                                        it from the header when inside your tracker.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
