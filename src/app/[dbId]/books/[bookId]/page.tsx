'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import BookForm from '@/components/BookForm';
import StyledDropdown from '@/components/StyledDropdown';
import { dataService } from '@/services/dataService';
import { Book, Collection, BookStatus } from '@/types';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function BookView() {
    const params = useParams();
    const router = useRouter();
    const dbId = params.dbId as string;
    const bookId = params.bookId as string;
    const [book, setBook] = useState<Book | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    useEffect(() => {
        if (dbId && bookId) {
            dataService.loadData(dbId);
            const bookData = dataService.getBook(bookId);
            const collectionsData = dataService.getCollections();

            if (!bookData) {
                router.push(`/${dbId}/books`);
                return;
            }

            setBook(bookData);
            setCollections(collectionsData);
        }
    }, [dbId, bookId, router]);

    const handleUpdateBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (book) {
            const updatedBook = dataService.updateBook(book.id, bookData);
            if (updatedBook) {
                setBook(updatedBook);
            }
        }
    };

    const handleDeleteBook = () => {
        if (book && confirm('Are you sure you want to delete this book?')) {
            dataService.deleteBook(book.id);
            router.push(`/${dbId}/books`);
        }
    };

    const handleStatusChange = (newStatus: BookStatus) => {
        if (book) {
            const updatedBook = dataService.updateBook(book.id, { status: newStatus });
            if (updatedBook) {
                setBook(updatedBook);
            }
        }
    };

    const handleCollectionChange = (newCollectionId: string) => {
        if (book) {
            const updatedBook = dataService.updateBook(book.id, { collectionId: newCollectionId });
            if (updatedBook) {
                setBook(updatedBook);
            }
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <StarIconSolid
                key={i}
                className={`
                    h-5 w-5
                    ${i < rating ? 'text-yellow-400 dark:text-yellow-300' : 'text-gray-300 dark:text-gray-600'}
                `}
            />
        ));
    };

    const statusOptions = [
        { value: 'TBR', label: 'To Be Read' },
        { value: 'Reading', label: 'Currently Reading' },
        { value: 'Read', label: 'Read' },
        { value: 'DNF', label: 'Did Not Finish' },
        { value: 'On Hold', label: 'On Hold' },
    ];

    const collectionOptions = collections.map((coll) => ({
        value: coll.id,
        label: coll.title,
    }));

    if (!book) {
        return (
            <Layout dbId={dbId}>
                <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
            </Layout>
        );
    }

    const collection = collections.find((c) => c.id === book.collectionId);

    return (
        <Layout dbId={dbId}>
            <div
                className={`
                    px-4
                    sm:px-0
                `}
            >
                {/* Header */}
                <div>
                    {/* Back Button */}
                    <button
                        onClick={() => router.push(`/${dbId}/books`)}
                        className={`
                            mb-2 inline-flex items-center text-gray-500
                            hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                        `}
                    >
                        <ArrowLeftIcon className="mr-1 h-5 w-5" />
                        Back to Books
                    </button>

                    {/* Title and Actions */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl leading-tight font-bold text-gray-900 dark:text-white">{book.title}</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsEditFormOpen(true)}
                                className={`
                                    inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2
                                    text-sm font-medium text-gray-700 shadow-sm
                                    hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200
                                    dark:hover:bg-gray-600
                                `}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteBook}
                                className={`
                                    inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2
                                    text-sm font-medium text-white shadow-sm
                                    hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800
                                `}
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Book Details */}
                <div className="mt-6 rounded-lg bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                    <div className="px-6 py-8">
                        <div
                            className={`
                                grid grid-cols-1 gap-6
                                lg:grid-cols-2
                            `}
                        >
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Title
                                    </label>
                                    <p className="mt-1 text-lg text-gray-900 dark:text-white">{book.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Author
                                    </label>
                                    <p className="mt-1 text-lg text-gray-900 dark:text-white">{book.author}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Rating
                                    </label>
                                    <div className="mt-1 flex">{renderStars(book.rating)}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <StyledDropdown
                                            value={book.status}
                                            onChange={(value) => handleStatusChange(value as BookStatus)}
                                            options={statusOptions}
                                            isStatusDropdown={true}
                                            showColors={true}
                                            variant="status-pill"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Collection
                                    </label>
                                    <div className="mt-1">
                                        <StyledDropdown
                                            value={book.collectionId}
                                            onChange={handleCollectionChange}
                                            options={collectionOptions}
                                            placeholder="Select a collection"
                                        />
                                    </div>
                                    {collection && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            {collection.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Review
                                    </label>
                                    <div className="mt-1">
                                        {book.review ? (
                                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                                <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                                                    {book.review}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic dark:text-gray-400">No review yet</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Added
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {new Date(book.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Last Updated
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {new Date(book.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form Modal */}
            <BookForm
                isOpen={isEditFormOpen}
                onClose={() => setIsEditFormOpen(false)}
                onSave={handleUpdateBook}
                book={book}
                collections={collections}
            />
        </Layout>
    );
}
