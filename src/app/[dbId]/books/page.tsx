'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import BookForm from '@/components/BookForm';
import CollectionForm from '@/components/CollectionForm';
import CollectionsManagementModal from '@/components/CollectionsManagementModal';
import StyledDropdown from '@/components/StyledDropdown';
import Loading from '@/components/Loading';
import { mongoDataService } from '@/services/mongoDataService';
import { Book, Collection, BookStatus } from '@/types';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    Cog6ToothIcon,
    BookOpenIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    PauseCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';

type SortField = 'title' | 'author' | 'rating' | 'status' | 'collection';
type SortDirection = 'asc' | 'desc';

export default function BooksPage() {
    const params = useParams();
    const dbId = params.dbId as string;
    const [books, setBooks] = useState<Book[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [sortField, setSortField] = useState<SortField>('title');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');
    const [collectionFilter, setCollectionFilter] = useState<string>('all');
    const [isBookFormOpen, setIsBookFormOpen] = useState(false);
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [isCollectionsManagementOpen, setIsCollectionsManagementOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | undefined>();

    // Loading states
    const [isAddingBook, setIsAddingBook] = useState(false);
    const [isUpdatingBook, setIsUpdatingBook] = useState(false);
    const [isDeletingBook, setIsDeletingBook] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
    const [isUpdatingCollection, setIsUpdatingCollection] = useState<string | null>(null);
    const [isAddingCollection, setIsAddingCollection] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Dropdown options
    const statusFilterOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'TBR', label: 'To Be Read' },
        { value: 'Reading', label: 'Currently Reading' },
        { value: 'Read', label: 'Read' },
        { value: 'DNF', label: 'Did Not Finish' },
        { value: 'On Hold', label: 'On Hold' },
    ];

    const collectionFilterOptions = [
        { value: 'all', label: 'All Collections' },
        ...collections.map((collection: Collection) => ({
            value: collection.id,
            label: collection.title,
        })),
    ];

    const statusOptions = [
        { value: 'TBR', label: 'TBR' },
        { value: 'Reading', label: 'Reading' },
        { value: 'Read', label: 'Read' },
        { value: 'DNF', label: 'DNF' },
        { value: 'On Hold', label: 'On Hold' },
    ];

    const collectionOptions = collections.map((coll: Collection) => ({
        value: coll.id,
        label: coll.title,
    }));

    const getStatusCounts = () => {
        const counts = {
            TBR: 0,
            Reading: 0,
            Read: 0,
            DNF: 0,
            'On Hold': 0,
        };

        books.forEach((book) => {
            counts[book.status]++;
        });

        return counts;
    };

    const statusCounts = getStatusCounts();

    const loadData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            await mongoDataService.loadData(dbId);
            const booksData = await mongoDataService.getBooks(dbId);
            const collectionsData = await mongoDataService.getCollections(dbId);
            setBooks(booksData);
            setCollections(collectionsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [dbId]);

    useEffect(() => {
        if (dbId) {
            mongoDataService.loadData(dbId);
            loadData();
        }
    }, [dbId, loadData]);

    // Filter and sort books
    useEffect(() => {
        let filtered = books;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter((book) => book.status === statusFilter);
        }

        // Filter by collection
        if (collectionFilter !== 'all') {
            filtered = filtered.filter((book) => book.collectionId === collectionFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortField) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'author':
                    aValue = a.author.toLowerCase();
                    bValue = b.author.toLowerCase();
                    break;
                case 'rating':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'collection':
                    const aCollection = collections.find((c) => c.id === a.collectionId);
                    const bCollection = collections.find((c) => c.id === b.collectionId);
                    aValue = aCollection?.title.toLowerCase() || '';
                    bValue = bCollection?.title.toLowerCase() || '';
                    break;
                default:
                    aValue = '';
                    bValue = '';
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredBooks(filtered);
    }, [books, statusFilter, collectionFilter, sortField, sortDirection, collections]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleAddBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsAddingBook(true);
        try {
            const newBook = await mongoDataService.addBook(bookData);
            // Optimistically update the books state
            setBooks((prevBooks) => [...prevBooks, newBook]);
            setIsBookFormOpen(false);
        } catch (error) {
            console.error('Error adding book:', error);
            // On error, reload data to ensure consistency
            await loadData();
        } finally {
            setIsAddingBook(false);
        }
    };

    const handleUpdateBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingBook) {
            setIsUpdatingBook(true);
            try {
                const updatedBook = await mongoDataService.updateBook(editingBook.id, bookData);
                if (updatedBook) {
                    // Optimistically update the books state
                    setBooks((prevBooks) => prevBooks.map((book) => (book.id === editingBook.id ? updatedBook : book)));
                } else {
                    // If update failed, reload data
                    await loadData();
                }
                setIsBookFormOpen(false);
                setEditingBook(undefined);
            } catch (error) {
                console.error('Error updating book:', error);
                // On error, reload data to ensure consistency
                await loadData();
            } finally {
                setIsUpdatingBook(false);
            }
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (confirm('Are you sure you want to delete this book?')) {
            setIsDeletingBook(bookId);
            try {
                const success = await mongoDataService.deleteBook(bookId);
                if (success) {
                    // Optimistically update the books state
                    setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
                } else {
                    // If delete failed, reload data
                    await loadData();
                }
            } catch (error) {
                console.error('Error deleting book:', error);
                // On error, reload data to ensure consistency
                await loadData();
            } finally {
                setIsDeletingBook(null);
            }
        }
    };

    const handleStatusChange = async (bookId: string, status: BookStatus) => {
        const book = books.find((b) => b.id === bookId);
        if (book) {
            setIsUpdatingStatus(bookId);
            // Optimistically update the UI first
            setBooks((prevBooks) => prevBooks.map((b) => (b.id === bookId ? { ...b, status } : b)));

            try {
                const updatedBook = await mongoDataService.updateBook(bookId, { ...book, status });
                if (!updatedBook) {
                    // If update failed, reload data to ensure consistency
                    await loadData();
                }
            } catch (error) {
                console.error('Error updating book status:', error);
                // On error, reload data to ensure consistency
                await loadData();
            } finally {
                setIsUpdatingStatus(null);
            }
        }
    };

    const handleCollectionChange = async (bookId: string, collectionId: string) => {
        const book = books.find((b) => b.id === bookId);
        if (book) {
            setIsUpdatingCollection(bookId);
            // Optimistically update the UI first
            setBooks((prevBooks) => prevBooks.map((b) => (b.id === bookId ? { ...b, collectionId } : b)));

            try {
                const updatedBook = await mongoDataService.updateBook(bookId, { ...book, collectionId });
                if (!updatedBook) {
                    // If update failed, reload data to ensure consistency
                    await loadData();
                }
            } catch (error) {
                console.error('Error updating book collection:', error);
                // On error, reload data to ensure consistency
                await loadData();
            } finally {
                setIsUpdatingCollection(null);
            }
        }
    };

    const handleAddCollection = async (collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsAddingCollection(true);
        try {
            const newCollection = await mongoDataService.addCollection(collectionData);
            // Optimistically update the collections state
            setCollections((prevCollections) => [...prevCollections, newCollection]);
            setIsCollectionFormOpen(false);
        } catch (error) {
            console.error('Error adding collection:', error);
            // On error, reload data to ensure consistency
            await loadData();
        } finally {
            setIsAddingCollection(false);
        }
    };

    const handleCollectionsUpdate = useCallback(async () => {
        // Only reload collections data, not books
        try {
            const collectionsData = await mongoDataService.getCollections(dbId);
            setCollections(collectionsData);
        } catch (error) {
            console.error('Error loading collections:', error);
        }
    }, [dbId]);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <StarIconSolid
                key={i}
                className={`
                    h-4 w-4
                    ${
                        i < rating
                            ? `
                                text-yellow-400
                                dark:text-yellow-300
                            `
                            : `
                                text-gray-300
                                dark:text-gray-600
                            `
                    }
                `}
            />
        ));
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    const getStatusIcon = (status: string) => {
        const iconClass = 'ml-6 mr-1 h-7 w-7';
        switch (status) {
            case 'TBR':
                return (
                    <ClockIcon
                        className={`
                            ${iconClass}
                            text-yellow-600
                            dark:text-yellow-400
                        `}
                    />
                );
            case 'Reading':
                return (
                    <BookOpenIcon
                        className={`
                            ${iconClass}
                            text-blue-600
                            dark:text-blue-400
                        `}
                    />
                );
            case 'Read':
                return (
                    <CheckCircleIcon
                        className={`
                            ${iconClass}
                            text-green-600
                            dark:text-green-400
                        `}
                    />
                );
            case 'DNF':
                return (
                    <XCircleIcon
                        className={`
                            ${iconClass}
                            text-red-600
                            dark:text-red-400
                        `}
                    />
                );
            case 'On Hold':
                return (
                    <PauseCircleIcon
                        className={`
                            ${iconClass}
                            text-gray-600
                            dark:text-gray-400
                        `}
                    />
                );
            default:
                return (
                    <BookOpenIcon
                        className={`
                            ${iconClass}
                            text-gray-600
                            dark:text-gray-400
                        `}
                    />
                );
        }
    };

    return (
        <Layout dbId={dbId}>
            {isLoadingData ? (
                <Loading message="Loading your reading tracker..." size="lg" className="py-32" />
            ) : (
                <div
                    className={`
                        px-4
                        sm:px-6
                        lg:px-8
                    `}
                >
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex-auto">
                            <h1
                                className={`
                                    text-2xl leading-6 font-semibold text-gray-900
                                    dark:text-white
                                `}
                            >
                                Books
                            </h1>
                            <p
                                className={`
                                    mt-2 text-sm text-gray-700
                                    dark:text-gray-300
                                `}
                            >
                                A list of all the books in your reading tracker including their title, author, rating,
                                status, and collection.
                            </p>
                        </div>
                        <div
                            className={`
                                mt-4 flex space-x-3
                                sm:mt-0 sm:ml-16 sm:flex-none
                            `}
                        >
                            <button
                                type="button"
                                onClick={() => setIsCollectionsManagementOpen(true)}
                                className={`
                                    inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2
                                    text-sm font-medium text-gray-700 shadow-sm
                                    hover:bg-gray-50
                                    dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
                                `}
                            >
                                <Cog6ToothIcon className="mr-2 h-4 w-4" />
                                Manage Collections
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsBookFormOpen(true)}
                                disabled={isAddingBook}
                                className={`
                                    inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2
                                    text-sm font-medium text-white shadow-sm
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed disabled:opacity-50
                                    dark:bg-blue-500 dark:hover:bg-blue-400
                                `}
                            >
                                {isAddingBook ? (
                                    <>
                                        <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add Book
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Reading Status and Total Books */}
                    <div
                        className={`
                            mt-10 mb-10 grid grid-cols-2 gap-5
                            sm:grid-cols-3
                            lg:grid-cols-6
                        `}
                    >
                        {/* Total Books Card */}
                        <div
                            className={`
                                flex min-w-[120px] items-center rounded-lg bg-white py-3 pr-9 shadow
                                dark:bg-gray-800
                            `}
                        >
                            <div className="flex-shrink-0">
                                <BuildingLibraryIcon
                                    className={`
                                        ml-7 h-7 w-7 text-blue-600
                                        dark:text-blue-400
                                    `}
                                />
                            </div>
                            <div className="ml-3 flex w-full flex-col items-center justify-center text-center">
                                <div
                                    className={`
                                        text-sm font-medium text-gray-500
                                        dark:text-gray-400
                                    `}
                                >
                                    Total
                                </div>
                                <div
                                    className={`
                                        text-2xl font-bold text-gray-900
                                        dark:text-white
                                    `}
                                >
                                    {books.length}
                                </div>
                            </div>
                        </div>
                        {/* Reading Status Cards */}
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <div
                                key={status}
                                className={`
                                    flex min-w-[120px] items-center rounded-lg bg-white py-3 pr-9 shadow
                                    dark:bg-gray-800
                                `}
                            >
                                <div className="flex-shrink-0">{getStatusIcon(status)}</div>
                                <div className="ml-3 flex w-full flex-col items-center justify-center text-center">
                                    <div
                                        className={`
                                            text-sm font-medium text-gray-500
                                            dark:text-gray-400
                                        `}
                                    >
                                        {status === 'On Hold' ? 'Pending' : status}
                                    </div>
                                    <div
                                        className={`
                                            text-2xl font-bold text-gray-900
                                            dark:text-white
                                        `}
                                    >
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div
                        className={`
                            mt-6 rounded-lg bg-white p-4 shadow
                            dark:bg-gray-800
                        `}
                    >
                        <div
                            className={`
                                grid grid-cols-1 gap-4
                                sm:grid-cols-2
                            `}
                        >
                            <div>
                                <label
                                    htmlFor="status-filter"
                                    className={`
                                        block text-sm font-medium text-gray-700
                                        dark:text-gray-300
                                    `}
                                >
                                    Filter by Status
                                </label>
                                <div className="mt-1">
                                    <StyledDropdown
                                        value={statusFilter}
                                        onChange={(value) => setStatusFilter(value as BookStatus | 'all')}
                                        options={statusFilterOptions}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="collection-filter"
                                    className={`
                                        block text-sm font-medium text-gray-700
                                        dark:text-gray-300
                                    `}
                                >
                                    Filter by Collection
                                </label>
                                <div className="mt-1">
                                    <StyledDropdown
                                        value={collectionFilter}
                                        onChange={setCollectionFilter}
                                        options={collectionFilterOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mt-8 flow-root">
                        {isAddingBook || isUpdatingBook ? (
                            <Loading
                                message={isAddingBook ? 'Adding book...' : 'Updating book...'}
                                size="lg"
                                className="py-16"
                            />
                        ) : (
                            <div
                                className={`
                                    -mx-4 -my-2 overflow-x-auto
                                    sm:-mx-6
                                    lg:-mx-8
                                `}
                            >
                                <div
                                    className={`
                                        inline-block min-w-full py-2 align-middle
                                        sm:px-6
                                        lg:px-8
                                    `}
                                >
                                    <div
                                        className={`
                                            ring-opacity-5 overflow-hidden shadow ring-1 ring-black
                                            sm:rounded-lg
                                            dark:ring-gray-700
                                        `}
                                    >
                                        <table
                                            className={`
                                                min-w-full divide-y divide-gray-300
                                                dark:divide-gray-600
                                            `}
                                        >
                                            <thead
                                                className={`
                                                    bg-gray-50
                                                    dark:bg-gray-700
                                                `}
                                            >
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className={`
                                                            cursor-pointer px-6 py-3 text-left text-xs font-medium
                                                            tracking-wide text-gray-500 uppercase
                                                            hover:bg-gray-100
                                                            dark:text-gray-300 dark:hover:bg-gray-600
                                                        `}
                                                        onClick={() => handleSort('title')}
                                                    >
                                                        Title{getSortIcon('title')}
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className={`
                                                            cursor-pointer px-6 py-3 text-left text-xs font-medium
                                                            tracking-wide text-gray-500 uppercase
                                                            hover:bg-gray-100
                                                            dark:text-gray-300 dark:hover:bg-gray-600
                                                        `}
                                                        onClick={() => handleSort('author')}
                                                    >
                                                        Author{getSortIcon('author')}
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className={`
                                                            cursor-pointer px-6 py-3 text-left text-xs font-medium
                                                            tracking-wide text-gray-500 uppercase
                                                            hover:bg-gray-100
                                                            dark:text-gray-300 dark:hover:bg-gray-600
                                                        `}
                                                        onClick={() => handleSort('rating')}
                                                    >
                                                        Rating{getSortIcon('rating')}
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className={`
                                                            cursor-pointer px-6 py-3 text-left text-xs font-medium
                                                            tracking-wide text-gray-500 uppercase
                                                            hover:bg-gray-100
                                                            dark:text-gray-300 dark:hover:bg-gray-600
                                                        `}
                                                        onClick={() => handleSort('status')}
                                                    >
                                                        Status{getSortIcon('status')}
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className={`
                                                            cursor-pointer px-6 py-3 text-left text-xs font-medium
                                                            tracking-wide text-gray-500 uppercase
                                                            hover:bg-gray-100
                                                            dark:text-gray-300 dark:hover:bg-gray-600
                                                        `}
                                                        onClick={() => handleSort('collection')}
                                                    >
                                                        Collection{getSortIcon('collection')}
                                                    </th>
                                                    <th scope="col" className="relative px-6 py-3">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody
                                                className={`
                                                    divide-y divide-gray-200 bg-white
                                                    dark:divide-gray-600 dark:bg-gray-800
                                                `}
                                            >
                                                {filteredBooks.map((book) => {
                                                    return (
                                                        <tr
                                                            key={book.id}
                                                            className={`
                                                                hover:bg-gray-50
                                                                dark:hover:bg-gray-700
                                                            `}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <Link
                                                                    href={`/${dbId}/books/${book.id}`}
                                                                    className={`
                                                                        font-medium text-blue-600
                                                                        hover:text-blue-800
                                                                        dark:text-blue-400 dark:hover:text-blue-300
                                                                    `}
                                                                >
                                                                    {book.title}
                                                                </Link>
                                                            </td>
                                                            <td
                                                                className={`
                                                                    px-6 py-4 whitespace-nowrap text-gray-900
                                                                    dark:text-white
                                                                `}
                                                            >
                                                                {book.author}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex">{renderStars(book.rating)}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="relative">
                                                                    <StyledDropdown
                                                                        value={book.status}
                                                                        onChange={(value) =>
                                                                            handleStatusChange(
                                                                                book.id,
                                                                                value as BookStatus
                                                                            )
                                                                        }
                                                                        options={statusOptions}
                                                                        isStatusDropdown={true}
                                                                        showColors={true}
                                                                        variant="status-pill"
                                                                        disabled={isUpdatingStatus === book.id}
                                                                    />
                                                                    {isUpdatingStatus === book.id && (
                                                                        <div
                                                                            className={`
                                                                                absolute inset-y-0 right-0 flex
                                                                                items-center pr-3
                                                                            `}
                                                                        >
                                                                            <ArrowPathIcon
                                                                                className={`
                                                                                    h-4 w-4 animate-spin text-gray-400
                                                                                `}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="relative">
                                                                    <StyledDropdown
                                                                        value={book.collectionId}
                                                                        onChange={(value) =>
                                                                            handleCollectionChange(book.id, value)
                                                                        }
                                                                        options={collectionOptions}
                                                                        className="text-sm"
                                                                        disabled={isUpdatingCollection === book.id}
                                                                    />
                                                                    {isUpdatingCollection === book.id && (
                                                                        <div
                                                                            className={`
                                                                                absolute inset-y-0 right-0 flex
                                                                                items-center pr-3
                                                                            `}
                                                                        >
                                                                            <ArrowPathIcon
                                                                                className={`
                                                                                    h-4 w-4 animate-spin text-gray-400
                                                                                `}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td
                                                                className={`
                                                                    px-6 py-4 text-right text-sm font-medium
                                                                    whitespace-nowrap
                                                                `}
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingBook(book);
                                                                        setIsBookFormOpen(true);
                                                                    }}
                                                                    className={`
                                                                        mr-3 text-blue-600
                                                                        hover:text-blue-900
                                                                        dark:text-blue-400 dark:hover:text-blue-300
                                                                    `}
                                                                >
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBook(book.id)}
                                                                    disabled={isDeletingBook === book.id}
                                                                    className={`
                                                                        text-red-600
                                                                        hover:text-red-900
                                                                        disabled:cursor-not-allowed disabled:opacity-50
                                                                        dark:text-red-400 dark:hover:text-red-300
                                                                    `}
                                                                >
                                                                    {isDeletingBook === book.id ? (
                                                                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <TrashIcon className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {filteredBooks.length === 0 && (
                                            <div className="py-8 text-center">
                                                <p
                                                    className={`
                                                        text-gray-500
                                                        dark:text-gray-400
                                                    `}
                                                >
                                                    No books found matching your filters.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Book Form Modal */}
            <BookForm
                isOpen={isBookFormOpen}
                onClose={() => {
                    setIsBookFormOpen(false);
                    setEditingBook(undefined);
                }}
                onSave={editingBook ? handleUpdateBook : handleAddBook}
                book={editingBook}
                collections={collections}
                isLoading={editingBook ? isUpdatingBook : isAddingBook}
            />

            {/* Collection Form Modal */}
            <CollectionForm
                isOpen={isCollectionFormOpen}
                onClose={() => setIsCollectionFormOpen(false)}
                onSave={handleAddCollection}
                isLoading={isAddingCollection}
            />

            {/* Collections Management Modal */}
            <CollectionsManagementModal
                isOpen={isCollectionsManagementOpen}
                onClose={() => setIsCollectionsManagementOpen(false)}
                onUpdate={handleCollectionsUpdate}
                dbId={dbId}
            />
        </Layout>
    );
}
