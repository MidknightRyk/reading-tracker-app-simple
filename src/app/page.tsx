'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mongoDataService } from '@/services/mongoDataService';
import { BookOpenIcon, PlusIcon, ArrowRightIcon, ClipboardDocumentIcon, KeyIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_COLLECTION_NAME, DEFAULT_COLLECTION_DESCRIPTION } from '@/lib/constants';

export default function Home() {
    const router = useRouter();
    const [existingDbId, setExistingDbId] = useState('');
    const [customDbId, setCustomDbId] = useState('');
    const [error, setError] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [isConnectingExisting, setIsConnectingExisting] = useState(false);

    const createNewDatabase = async () => {
        setIsCreatingNew(true);
        setError('');

        try {
            const newDbId = uuidv4();

            // Load the new database and create default collection
            await mongoDataService.loadData(newDbId);

            await mongoDataService.addCollection({
                title: DEFAULT_COLLECTION_NAME,
                description: DEFAULT_COLLECTION_DESCRIPTION,
            });

            router.push(`/${newDbId}`);
        } catch (err) {
            console.error('Error creating new database:', err);
            setError('Failed to create new database. Please try again.');
        } finally {
            setIsCreatingNew(false);
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

        setIsCreatingCustom(true);
        setError('');

        try {
            const success = await mongoDataService.createDatabaseWithId(customDbId.trim());
            if (success) {
                router.push(`/${customDbId.trim()}`);
            } else {
                setError('A database with this ID already exists. Please choose a different ID.');
            }
        } catch (err) {
            console.error('Error creating custom database:', err);
            setError('Failed to create database. Please try again.');
        } finally {
            setIsCreatingCustom(false);
        }
    };

    const handleUseExisting = async () => {
        if (!existingDbId.trim()) {
            setError('Please enter a database ID');
            return;
        }

        setIsConnectingExisting(true);
        setError('');

        try {
            // Try to load the existing database
            const dbExists = await mongoDataService.databaseExists(existingDbId.trim());
            if (dbExists) {
                router.push(`/${existingDbId.trim()}`);
            } else {
                setError('Database ID not found. Please check the ID or create a new database.');
            }
        } catch (err) {
            console.error('Error connecting to existing database:', err);
            setError('Invalid database ID format. Please check and try again.');
        } finally {
            setIsConnectingExisting(false);
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
        <div
            className={`
                min-h-screen bg-white transition-colors duration-150
                dark:bg-gray-900
            `}
        >
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>
            <div
                className={`
                    flex min-h-screen items-center justify-center px-4 py-12
                    sm:px-6
                    lg:px-8
                `}
            >
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div
                            className={`
                                mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100
                                dark:bg-blue-900/60
                            `}
                        >
                            <BookOpenIcon
                                className={`
                                    h-10 w-10 text-blue-600
                                    dark:text-blue-300
                                `}
                            />
                        </div>
                        <h1
                            className={`
                                mt-6 text-3xl font-bold tracking-tight text-gray-900
                                dark:text-white
                            `}
                        >
                            Reading Tracker
                        </h1>
                        <p
                            className={`
                                mt-2 text-sm text-gray-600
                                dark:text-gray-300
                            `}
                        >
                            Organize your books and track your reading progress
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className={`
                                rounded-md bg-red-50 p-4
                                dark:bg-red-900/40
                            `}
                        >
                            <div
                                className={`
                                    text-sm text-red-700
                                    dark:text-red-300
                                `}
                            >
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Create New Database */}
                        <div
                            className={`
                                rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-200
                                dark:bg-gray-800 dark:ring-gray-700
                            `}
                        >
                            <h2
                                className={`
                                    text-lg font-semibold text-gray-900
                                    dark:text-white
                                `}
                            >
                                Start Fresh
                            </h2>
                            <p
                                className={`
                                    mt-2 text-sm text-gray-600
                                    dark:text-gray-300
                                `}
                            >
                                Create a new reading tracker with a randomly generated unique ID
                            </p>
                            <button
                                onClick={createNewDatabase}
                                disabled={isCreatingNew}
                                className={`
                                    mt-4 flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2
                                    text-sm font-semibold text-white shadow-sm
                                    hover:bg-blue-500
                                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
                                    disabled:cursor-not-allowed disabled:opacity-50
                                    dark:bg-blue-700 dark:hover:bg-blue-600
                                `}
                            >
                                {isCreatingNew ? (
                                    <>
                                        <div
                                            className={`
                                                mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                                                border-t-transparent
                                            `}
                                        ></div>
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
                        <div
                            className={`
                                rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-200
                                dark:bg-gray-800 dark:ring-gray-700
                            `}
                        >
                            <h2
                                className={`
                                    text-lg font-semibold text-gray-900
                                    dark:text-white
                                `}
                            >
                                Create Custom Database
                            </h2>
                            <p
                                className={`
                                    mt-2 text-sm text-gray-600
                                    dark:text-gray-300
                                `}
                            >
                                Create a new database with your own custom ID
                            </p>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label
                                        htmlFor="customDbId"
                                        className={`
                                            block text-sm font-medium text-gray-700
                                            dark:text-gray-200
                                        `}
                                    >
                                        Custom Database ID
                                    </label>
                                    <input
                                        type="text"
                                        id="customDbId"
                                        value={customDbId}
                                        onChange={(e) => setCustomDbId(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, 'custom')}
                                        placeholder="my-reading-tracker"
                                        className={`
                                            mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2
                                            text-gray-900 placeholder-gray-400 shadow-sm
                                            focus:border-blue-500 focus:ring-blue-500 focus:outline-none
                                            sm:text-sm
                                            dark:border-gray-600 dark:bg-gray-900 dark:text-white
                                            dark:placeholder-gray-500
                                        `}
                                    />
                                    <p
                                        className={`
                                            mt-1 text-xs text-gray-500
                                            dark:text-gray-400
                                        `}
                                    >
                                        Only letters, numbers, hyphens, and underscores allowed. Minimum 3 characters.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCreateCustom}
                                    disabled={isCreatingCustom || !customDbId.trim()}
                                    className={`
                                        flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2
                                        text-sm font-semibold text-white shadow-sm
                                        hover:bg-indigo-500
                                        focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none
                                        disabled:cursor-not-allowed disabled:opacity-50
                                        dark:bg-indigo-700 dark:hover:bg-indigo-600
                                    `}
                                >
                                    {isCreatingCustom ? (
                                        <>
                                            <div
                                                className={`
                                                    mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                                                    border-t-transparent
                                                `}
                                            ></div>
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
                                <div
                                    className={`
                                        w-full border-t border-gray-300
                                        dark:border-gray-700
                                    `}
                                />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span
                                    className={`
                                        bg-gray-50 px-2 text-gray-500
                                        dark:bg-gray-900 dark:text-gray-400
                                    `}
                                >
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Use Existing Database */}
                        <div
                            className={`
                                rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-200
                                dark:bg-gray-800 dark:ring-gray-700
                            `}
                        >
                            <h2
                                className={`
                                    text-lg font-semibold text-gray-900
                                    dark:text-white
                                `}
                            >
                                Continue Reading
                            </h2>
                            <p
                                className={`
                                    mt-2 text-sm text-gray-600
                                    dark:text-gray-300
                                `}
                            >
                                Enter your existing database ID to access your books
                            </p>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label
                                        htmlFor="dbId"
                                        className={`
                                            block text-sm font-medium text-gray-700
                                            dark:text-gray-200
                                        `}
                                    >
                                        Database ID
                                    </label>
                                    <input
                                        type="text"
                                        id="dbId"
                                        value={existingDbId}
                                        onChange={(e) => setExistingDbId(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, 'existing')}
                                        placeholder="Enter your database ID"
                                        className={`
                                            mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2
                                            text-gray-900 placeholder-gray-400 shadow-sm
                                            focus:border-blue-500 focus:ring-blue-500 focus:outline-none
                                            sm:text-sm
                                            dark:border-gray-600 dark:bg-gray-900 dark:text-white
                                            dark:placeholder-gray-500
                                        `}
                                    />
                                </div>
                                <button
                                    onClick={handleUseExisting}
                                    disabled={isConnectingExisting || !existingDbId.trim()}
                                    className={`
                                        flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm
                                        font-semibold text-white shadow-sm
                                        hover:bg-gray-500
                                        focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none
                                        disabled:cursor-not-allowed disabled:opacity-50
                                        dark:bg-gray-700 dark:hover:bg-gray-600
                                    `}
                                >
                                    {isConnectingExisting ? (
                                        <>
                                            <div
                                                className={`
                                                    mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                                                    border-t-transparent
                                                `}
                                            ></div>
                                            Connecting...
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
                    <div
                        className={`
                            rounded-lg bg-blue-50 p-4
                            dark:bg-blue-950/40
                        `}
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ClipboardDocumentIcon
                                    className={`
                                        h-5 w-5 text-blue-400
                                        dark:text-blue-300
                                    `}
                                />
                            </div>
                            <div className="ml-3">
                                <h3
                                    className={`
                                        text-sm font-medium text-blue-800
                                        dark:text-blue-200
                                    `}
                                >
                                    Keep Your Database ID Safe
                                </h3>
                                <div
                                    className={`
                                        mt-2 text-sm text-blue-700
                                        dark:text-blue-200
                                    `}
                                >
                                    <p>
                                        Your database ID is your unique link to access your reading tracker. Save it
                                        somewhere safe or bookmark the URL once you&apos;re redirected. You can always
                                        copy it from the header when inside your tracker.
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
