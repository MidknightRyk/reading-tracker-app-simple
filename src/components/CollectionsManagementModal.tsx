'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, ViewColumnsIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Collection } from '@/types';
import { dataService } from '@/services/dataService';
import CollectionForm from './CollectionForm';

interface CollectionsManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function CollectionsManagementModal({ isOpen, onClose, onUpdate }: CollectionsManagementModalProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | undefined>();

    useEffect(() => {
        if (isOpen) {
            loadCollections();
        }
    }, [isOpen]);

    const loadCollections = () => {
        const collectionsData = dataService.getCollections();
        setCollections(collectionsData);
    };

    const handleAddCollection = (collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            dataService.addCollection(collectionData);
            loadCollections();
            onUpdate();
            setIsCollectionFormOpen(false);
        } catch (error) {
            // Error will be handled by the CollectionForm component
            throw error;
        }
    };

    const handleUpdateCollection = (collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingCollection) {
            try {
                dataService.updateCollection(editingCollection.id, collectionData);
                loadCollections();
                onUpdate();
                setIsCollectionFormOpen(false);
                setEditingCollection(undefined);
            } catch (error) {
                // Error will be handled by the CollectionForm component
                throw error;
            }
        }
    };

    const handleDeleteCollection = (collectionId: string) => {
        if (collections.length <= 1) {
            alert('You must have at least one collection.');
            return;
        }

        if (
            confirm(
                'Are you sure you want to delete this collection? All books in this collection will be moved to another collection.'
            )
        ) {
            const remainingCollections = collections.filter((c) => c.id !== collectionId);
            const targetCollectionId = remainingCollections[0].id;

            // Move books to the first remaining collection
            const booksInCollection = dataService.getBooksByCollection(collectionId);
            booksInCollection.forEach((book) => {
                dataService.updateBook(book.id, { ...book, collectionId: targetCollectionId });
            });

            dataService.deleteCollection(collectionId);
            loadCollections();
            onUpdate();
        }
    };

    const handleClose = () => {
        setIsCollectionFormOpen(false);
        setEditingCollection(undefined);
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
                                    `}
                                    onClick={handleClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="w-full">
                                    <DialogTitle as="h3" className="text-base leading-6 font-semibold text-gray-900">
                                        Manage Collections
                                    </DialogTitle>

                                    <div className="mt-4">
                                        <div className="mb-6 flex items-center justify-between">
                                            <p className="text-sm text-gray-500">
                                                Organize your books into collections. You can create, edit, and delete
                                                collections here.
                                            </p>
                                            <button
                                                onClick={() => setIsCollectionFormOpen(true)}
                                                className={`
                                                    inline-flex items-center rounded-md border border-transparent
                                                    bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                                                    hover:bg-blue-700
                                                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                    focus:outline-none
                                                `}
                                            >
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Add Collection
                                            </button>
                                        </div>

                                        {collections.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <ViewColumnsIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                    No collections
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Get started by creating a new collection.
                                                </p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => setIsCollectionFormOpen(true)}
                                                        className={`
                                                            inline-flex items-center rounded-md border
                                                            border-transparent bg-blue-600 px-4 py-2 text-sm font-medium
                                                            text-white shadow-sm
                                                            hover:bg-blue-700
                                                        `}
                                                    >
                                                        <PlusIcon className="mr-2 h-4 w-4" />
                                                        Add Collection
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
                                                        const bookCount = dataService.getBooksByCollection(
                                                            collection.id
                                                        ).length;
                                                        return (
                                                            <div
                                                                key={collection.id}
                                                                className={`
                                                                    rounded-lg border border-gray-200 p-4
                                                                    transition-colors
                                                                    hover:border-gray-300
                                                                `}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <ViewColumnsIcon
                                                                            className={`
                                                                                h-8 w-8 flex-shrink-0 text-blue-500
                                                                            `}
                                                                        />
                                                                        <div className="ml-3 min-w-0 flex-1">
                                                                            <h3
                                                                                className={`
                                                                                    truncate text-lg font-medium
                                                                                    text-gray-900
                                                                                `}
                                                                            >
                                                                                {collection.title}
                                                                            </h3>
                                                                            <p className="text-sm text-gray-500">
                                                                                {bookCount} books
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
                                                                                className={`
                                                                                    rounded p-1 text-gray-400
                                                                                    hover:text-red-600
                                                                                    focus:ring-2 focus:ring-red-500
                                                                                    focus:outline-none
                                                                                `}
                                                                            >
                                                                                <TrashIcon className="h-5 w-5" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4">
                                                                    <p className="line-clamp-2 text-sm text-gray-700">
                                                                        {collection.description}
                                                                    </p>
                                                                </div>
                                                                <div className="mt-4 text-xs text-gray-500">
                                                                    Created:{' '}
                                                                    {new Date(
                                                                        collection.createdAt
                                                                    ).toLocaleDateString()}
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
            />
        </>
    );
}
