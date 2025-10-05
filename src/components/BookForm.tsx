'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Book, Collection, BookStatus } from '@/types';
import StyledDropdown from './StyledDropdown';

interface BookFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => void;
    book?: Book;
    collections: Collection[];
    isLoading?: boolean;
}

export default function BookForm({ isOpen, onClose, onSave, book, collections, isLoading = false }: BookFormProps) {
    const statusOptions = [
        { value: 'TBR', label: 'To Be Read' },
        { value: 'Reading', label: 'Currently Reading' },
        { value: 'Read', label: 'Read' },
        { value: 'DNF', label: 'Did Not Finish' },
        { value: 'On Hold', label: 'On Hold' },
    ];

    const collectionOptions = collections.map((collection) => ({
        value: collection.id,
        label: collection.title,
    }));

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        review: '',
        rating: 0,
        status: 'TBR' as BookStatus,
        collectionId: '',
    });

    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title,
                author: book.author,
                review: book.review || '',
                rating: book.rating,
                status: book.status,
                collectionId: book.collectionId,
            });
        } else {
            setFormData({
                title: '',
                author: '',
                review: '',
                rating: 0,
                status: 'TBR',
                collectionId: collections[0]?.id || '',
            });
        }
    }, [book, collections, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.author || !formData.collectionId) return;

        onSave(formData);
        onClose();
    };

    const handleRatingClick = (rating: number) => {
        setFormData((prev) => ({
            ...prev,
            rating: prev.rating === rating ? 0 : rating,
        }));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop
                className={`
                    bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity
                    dark:bg-opacity-75 dark:bg-gray-900
                `}
            />

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div
                    className={`
                        flex min-h-full items-end justify-center p-4 text-center
                        sm:items-center sm:p-0
                    `}
                >
                    <DialogPanel
                        className={`
                            relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl
                            transition-all
                            sm:my-8 sm:w-full sm:max-w-lg sm:p-6
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
                                    dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-400
                                `}
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-6 w-6" />
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
                                    {book ? 'Edit Book' : 'Add New Book'}
                                </DialogTitle>

                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="title"
                                            className={`
                                                block text-sm font-medium text-gray-700
                                                dark:text-gray-300
                                            `}
                                        >
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            required
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                            className={`
                                                mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                                                focus:border-blue-500 focus:ring-blue-500
                                                sm:text-sm
                                                dark:border-gray-600 dark:bg-gray-700 dark:text-white
                                                dark:focus:border-blue-400 dark:focus:ring-blue-400
                                            `}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="author"
                                            className={`
                                                block text-sm font-medium text-gray-700
                                                dark:text-gray-300
                                            `}
                                        >
                                            Author *
                                        </label>
                                        <input
                                            type="text"
                                            id="author"
                                            required
                                            value={formData.author}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, author: e.target.value }))
                                            }
                                            className={`
                                                mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                                                focus:border-blue-500 focus:ring-blue-500
                                                sm:text-sm
                                                dark:border-gray-600 dark:bg-gray-700 dark:text-white
                                                dark:focus:border-blue-400 dark:focus:ring-blue-400
                                            `}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="status"
                                            className={`
                                                block text-sm font-medium text-gray-700
                                                dark:text-gray-300
                                            `}
                                        >
                                            Status *
                                        </label>
                                        <div className="mt-1">
                                            <StyledDropdown
                                                value={formData.status}
                                                onChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        status: value as BookStatus,
                                                    }))
                                                }
                                                options={statusOptions}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="collection"
                                            className={`
                                                block text-sm font-medium text-gray-700
                                                dark:text-gray-300
                                            `}
                                        >
                                            Collection *
                                        </label>
                                        <div className="mt-1">
                                            <StyledDropdown
                                                value={formData.collectionId}
                                                onChange={(value) =>
                                                    setFormData((prev) => ({ ...prev, collectionId: value }))
                                                }
                                                options={collectionOptions}
                                                placeholder="Select a collection"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className={`
                                                block text-sm font-medium text-gray-700
                                                dark:text-gray-300
                                            `}
                                        >
                                            Rating *
                                        </label>
                                        <div className="mt-1 flex space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleRatingClick(star)}
                                                    className="focus:outline-none"
                                                >
                                                    {star <= formData.rating ? (
                                                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                                                    ) : (
                                                        <StarIcon className="h-6 w-6 text-gray-300" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="review"
                                            className={`
                                                block text-sm font-medium text-gray-700
                                                dark:text-gray-300
                                            `}
                                        >
                                            Review
                                        </label>
                                        <textarea
                                            id="review"
                                            rows={3}
                                            value={formData.review}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, review: e.target.value }))
                                            }
                                            className={`
                                                mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                                                focus:border-blue-500 focus:ring-blue-500
                                                sm:text-sm
                                                dark:border-gray-600 dark:bg-gray-700 dark:text-white
                                                dark:focus:border-blue-400 dark:focus:ring-blue-400
                                            `}
                                        />
                                    </div>

                                    <div
                                        className={`
                                            mt-5
                                            sm:mt-4 sm:flex sm:flex-row-reverse
                                        `}
                                    >
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`
                                                inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2
                                                text-sm font-semibold text-white shadow-sm
                                                hover:bg-blue-500
                                                disabled:cursor-not-allowed disabled:opacity-50
                                                sm:ml-3 sm:w-auto
                                                dark:bg-blue-500 dark:hover:bg-blue-400
                                            `}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                                                    {book ? 'Updating...' : 'Adding...'}
                                                </>
                                            ) : (
                                                `${book ? 'Update' : 'Add'} Book`
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className={`
                                                mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2
                                                text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300
                                                ring-inset
                                                hover:bg-gray-50
                                                sm:mt-0 sm:w-auto
                                                dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600
                                                dark:hover:bg-gray-600
                                            `}
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
