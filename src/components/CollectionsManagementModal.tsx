'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import {
    XMarkIcon,
    ViewColumnsIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Collection } from '@/types';
import { mongoDataService } from '@/services/mongoDataService';
import CollectionForm from './CollectionForm';
import Loading from './Loading';

interface CollectionsManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    dbId: string;
}

export default function CollectionsManagementModal({
    isOpen,
    onClose,
    onUpdate,
    dbId,
}: CollectionsManagementModalProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [bookCounts, setBookCounts] = useState<Record<string, number>>({});
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | undefined>();
    const [isAddingCollection, setIsAddingCollection] = useState(false);
    const [isDeletingCollection, setIsDeletingCollection] = useState<string | null>(null);
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    const loadCollections = useCallback(async () => {
        setIsLoadingCollections(true);
        try {
            const collectionsData = await mongoDataService.getCollections(dbId);
            setCollections(collectionsData);

            // Fetch all books and count per collection
            const books = await mongoDataService.getBooks(dbId);
            const counts: Record<string, number> = {};

            collectionsData.forEach((coll: Collection) => {
                const collId = coll.id;
                counts[collId] = books.filter((book) => book.collectionId === collId).length;
            });

            setBookCounts(counts);
        } catch (error) {
            console.error('Error loading collections:', error);
        } finally {
            setIsLoadingCollections(false);
        }
    }, [dbId]);

    useEffect(() => {
        if (isOpen) {
            loadCollections();
        }
    }, [isOpen, loadCollections]);

    useEffect(() => {
        if (isOpen) {
            loadCollections();
        }
    }, [isOpen, loadCollections]);

    const handleAddCollection = async (collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsAddingCollection(true);
        try {
            const newCollection = await mongoDataService.addCollection(collectionData);
            // Optimistically update the collections state
            setCollections((prevCollections) => [...prevCollections, newCollection]);
            setIsCollectionFormOpen(false);
            // Notify parent component to update its collections
            onUpdate();
        } catch (error) {
            console.error('Error adding collection:', error);
            // On error, reload data to ensure consistency
            await loadCollections();
            throw error;
        } finally {
            setIsAddingCollection(false);
        }
    };

    const handleUpdateCollection = async (collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingCollection) {
            try {
                const updatedCollection = await mongoDataService.updateCollection(editingCollection.id, collectionData);
                if (updatedCollection) {
                    // Optimistically update the collections state
                    setCollections((prevCollections) =>
                        prevCollections.map((collection) =>
                            collection.id === editingCollection.id ? updatedCollection : collection
                        )
                    );
                    // Notify parent component to update its collections
                    onUpdate();
                } else {
                    // If update failed, reload data
                    await loadCollections();
                }
                setIsCollectionFormOpen(false);
                setEditingCollection(undefined);
            } catch (error) {
                console.error('Error updating collection:', error);
                // On error, reload data to ensure consistency
                await loadCollections();
                throw error;
            }
        }
    };

    const handleDeleteCollection = async (collectionId: string) => {
        if (collections.length <= 1) {
            alert('You must have at least one collection.');
            return;
        }

        if (
            confirm(
                'Are you sure you want to delete this collection? All books in this collection will be moved to the first available collection.'
            )
        ) {
            setIsDeletingCollection(collectionId);
            try {
                // Get all books in this collection and move them to the first available collection
                const books = await mongoDataService.getBooks(dbId);
                const booksInCollection = books.filter((book) => book.collectionId === collectionId);
                const remainingCollections = collections.filter((c) => c.id !== collectionId);

                if (remainingCollections.length > 0 && booksInCollection.length > 0) {
                    const targetCollectionId = remainingCollections[0].id;

                    // Update all books to use the target collection
                    for (const book of booksInCollection) {
                        await mongoDataService.updateBook(book.id, {
                            ...book,
                            collectionId: targetCollectionId,
                        });
                    }
                }

                // Now delete the collection
                const success = await mongoDataService.deleteCollection(collectionId);
                if (success) {
                    // Optimistically update the collections state
                    setCollections((prevCollections) => prevCollections.filter((c) => c.id !== collectionId));
                    // Notify parent component to update its collections
                    onUpdate();
                } else {
                    // If delete failed, reload data
                    await loadCollections();
                }
            } catch (error) {
                console.error('Error deleting collection:', error);
                alert('Error deleting collection. Please try again.');
            } finally {
                setIsDeletingCollection(null);
            }
        }
    };

    const handleClose = () => {
        setIsCollectionFormOpen(false);
        setEditingCollection(undefined);
        // Update parent component's collections when modal closes
        onUpdate();
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
                <DialogBackdrop
                    className={`
                        bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity
                        dark:bg-opacity-75 dark:bg-gray-900
                    `}
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div
                        className={`
                            flex min-h-full items-end justify-center p-4 text-center
                            sm:items-center sm:p-0
                        `}
                    >
                        <DialogPanel
                            className={`
                                relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left
                                shadow-xl transition-all
                                sm:my-8 sm:w-full sm:max-w-4xl sm:p-6
                                dark:bg-gray-800
                            `}
                        >
                            <div
                                className={`
                                    absolute top-0 right-0 hidden pt-4 pr-4
                                    sm:block
                                `}
                            >
                                <button
                                    type="button"
                                    className={`
                                        rounded-md bg-white text-gray-400
                                        hover:text-gray-500
                                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
                                        dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300
                                    `}
                                    onClick={handleClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="w-full">
                                    <DialogTitle
                                        as="h3"
                                        className={`
                                            text-base leading-6 font-semibold text-gray-900
                                            dark:text-white
                                        `}
                                    >
                                        Manage Collections
                                    </DialogTitle>

                                    <div className="mt-4">
                                        <div className="mb-6 flex items-center justify-between">
                                            <p
                                                className={`
                                                    text-sm text-gray-500
                                                    dark:text-gray-400
                                                `}
                                            >
                                                Organize your books into collections. You can create, edit, and delete
                                                collections here.
                                            </p>
                                            <button
                                                onClick={() => setIsCollectionFormOpen(true)}
                                                disabled={isAddingCollection}
                                                className={`
                                                    inline-flex items-center rounded-md border border-transparent
                                                    bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                                                    hover:bg-blue-700
                                                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                    focus:outline-none
                                                    disabled:cursor-not-allowed disabled:opacity-50
                                                    dark:bg-blue-500 dark:hover:bg-blue-400
                                                `}
                                            >
                                                {isAddingCollection ? (
                                                    <>
                                                        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlusIcon className="mr-2 h-4 w-4" />
                                                        Add Collection
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {isLoadingCollections ? (
                                            <Loading message="Loading collections..." size="lg" className="py-16" />
                                        ) : isAddingCollection || isDeletingCollection ? (
                                            <Loading
                                                message={
                                                    isAddingCollection
                                                        ? 'Adding collection...'
                                                        : 'Deleting collection...'
                                                }
                                                size="lg"
                                                className="py-16"
                                            />
                                        ) : collections.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <ViewColumnsIcon
                                                    className={`
                                                        mx-auto h-12 w-12 text-gray-400
                                                        dark:text-gray-500
                                                    `}
                                                />
                                                <h3
                                                    className={`
                                                        mt-2 text-sm font-medium text-gray-900
                                                        dark:text-white
                                                    `}
                                                >
                                                    No collections
                                                </h3>
                                                <p
                                                    className={`
                                                        mt-1 text-sm text-gray-500
                                                        dark:text-gray-400
                                                    `}
                                                >
                                                    Get started by creating a new collection.
                                                </p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => setIsCollectionFormOpen(true)}
                                                        disabled={isAddingCollection}
                                                        className={`
                                                            inline-flex items-center rounded-md border
                                                            border-transparent bg-blue-600 px-4 py-2 text-sm font-medium
                                                            text-white shadow-sm
                                                            hover:bg-blue-700
                                                            disabled:cursor-not-allowed disabled:opacity-50
                                                            dark:bg-blue-500 dark:hover:bg-blue-400
                                                        `}
                                                    >
                                                        {isAddingCollection ? (
                                                            <>
                                                                <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                                Add Collection
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto">
                                                <div
                                                    className={`
                                                        grid grid-cols-1 gap-4
                                                        sm:grid-cols-2
                                                    `}
                                                >
                                                    {collections.map((collection) => {
                                                        return (
                                                            <div
                                                                key={collection.id}
                                                                className={`
                                                                    rounded-lg border border-gray-200 p-4
                                                                    transition-colors
                                                                    hover:border-gray-300
                                                                    dark:border-gray-600 dark:hover:border-gray-500
                                                                `}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <ViewColumnsIcon
                                                                            className={`
                                                                                h-8 w-8 flex-shrink-0 text-blue-500
                                                                                dark:text-blue-400
                                                                            `}
                                                                        />
                                                                        <div className="ml-3 min-w-0 flex-1">
                                                                            <h3
                                                                                className={`
                                                                                    truncate text-lg font-medium
                                                                                    text-gray-900
                                                                                    dark:text-white
                                                                                `}
                                                                            >
                                                                                {collection.title}
                                                                            </h3>
                                                                            <p
                                                                                className={`
                                                                                    text-sm text-gray-500
                                                                                    dark:text-gray-400
                                                                                `}
                                                                            >
                                                                                {bookCounts[collection.id] || 0} books
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-shrink-0 space-x-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingCollection(collection);
                                                                                setIsCollectionFormOpen(true);
                                                                            }}
                                                                            className={`
                                                                                rounded p-1 text-gray-400
                                                                                hover:text-gray-600
                                                                                focus:ring-2 focus:ring-blue-500
                                                                                focus:outline-none
                                                                                dark:text-gray-500
                                                                                dark:hover:text-gray-300
                                                                            `}
                                                                        >
                                                                            <PencilIcon className="h-5 w-5" />
                                                                        </button>
                                                                        {collections.length > 1 && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeleteCollection(
                                                                                        collection.id
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isDeletingCollection ===
                                                                                    collection.id
                                                                                }
                                                                                className={`
                                                                                    rounded p-1 text-gray-400
                                                                                    hover:text-red-600
                                                                                    focus:ring-2 focus:ring-red-500
                                                                                    focus:outline-none
                                                                                    disabled:cursor-not-allowed
                                                                                    disabled:opacity-50
                                                                                    dark:text-gray-500
                                                                                    dark:hover:text-red-400
                                                                                `}
                                                                            >
                                                                                {isDeletingCollection ===
                                                                                collection.id ? (
                                                                                    <ArrowPathIcon
                                                                                        className={`
                                                                                            h-5 w-5 animate-spin
                                                                                        `}
                                                                                    />
                                                                                ) : (
                                                                                    <TrashIcon className="h-5 w-5" />
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4">
                                                                    <p
                                                                        className={`
                                                                            line-clamp-2 text-sm text-gray-700
                                                                            dark:text-gray-300
                                                                        `}
                                                                    >
                                                                        {collection.description}
                                                                    </p>
                                                                </div>
                                                                <div
                                                                    className={`
                                                                        mt-4 text-xs text-gray-500
                                                                        dark:text-gray-400
                                                                    `}
                                                                >
                                                                    Created:{' '}
                                                                    {collection.createdAt
                                                                        ? new Date(
                                                                              collection.createdAt
                                                                          ).toLocaleDateString()
                                                                        : ''}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`
                                    mt-5
                                    sm:mt-4 sm:flex sm:flex-row-reverse
                                `}
                            >
                                <button
                                    type="button"
                                    className={`
                                        mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm
                                        font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset
                                        hover:bg-gray-50
                                        sm:mt-0 sm:w-auto
                                        dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600
                                    `}
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Collection Form Modal */}
            <CollectionForm
                isOpen={isCollectionFormOpen}
                onClose={() => {
                    setIsCollectionFormOpen(false);
                    setEditingCollection(undefined);
                }}
                onSave={editingCollection ? handleUpdateCollection : handleAddCollection}
                collection={editingCollection}
                isLoading={isAddingCollection}
            />
        </>
    );
}
