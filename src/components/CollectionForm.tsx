'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Collection } from '@/types';

interface CollectionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => void;
    collection?: Collection;
}

export default function CollectionForm({ isOpen, onClose, onSave, collection }: CollectionFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (collection) {
            setFormData({
                title: collection.title,
                description: collection.description,
            });
        } else {
            setFormData({
                title: '',
                description: 'New Collection',
            });
        }
        setError(''); // Clear errors when opening/closing form
    }, [collection, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('Collection title is required');
            return;
        }

        try {
            onSave(formData);
            onClose();
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity" />

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
                                `}
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <DialogTitle as="h3" className="text-base leading-6 font-semibold text-gray-900">
                                    {collection ? 'Edit Collection' : 'Add New Collection'}
                                </DialogTitle>

                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    {error && (
                                        <div className="rounded-md bg-red-50 p-4">
                                            <div className="text-sm text-red-700">{error}</div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            required
                                            value={formData.title}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, title: e.target.value }));
                                                setError(''); // Clear error when user starts typing
                                            }}
                                            className={`
                                                mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                                                focus:border-blue-500 focus:ring-blue-500
                                                sm:text-sm
                                            `}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Description *
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            required
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                            className={`
                                                mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm
                                                focus:border-blue-500 focus:ring-blue-500
                                                sm:text-sm
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
                                            className={`
                                                inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2
                                                text-sm font-semibold text-white shadow-sm
                                                hover:bg-blue-500
                                                sm:ml-3 sm:w-auto
                                            `}
                                        >
                                            {collection ? 'Update' : 'Add'} Collection
                                        </button>
                                        <button
                                            type="button"
                                            className={`
                                                mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2
                                                text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300
                                                ring-inset
                                                hover:bg-gray-50
                                                sm:mt-0 sm:w-auto
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
