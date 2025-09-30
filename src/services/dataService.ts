import { v4 as uuidv4 } from 'uuid';
import { Book, Collection, Database, BookStatus, DashboardStats } from '@/types';

const STORAGE_KEY = 'reading-tracker-db';

class DataService {
    private data: Database | null = null;

    // Initialize default data
    private getDefaultData(): Database {
        const defaultCollection: Collection = {
            id: uuidv4(),
            title: 'My Books',
            description: 'Default collection for all books',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return {
            id: uuidv4(),
            books: [],
            collections: [defaultCollection],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    // Load data from localStorage or create default
    loadData(dbId?: string): Database {
        if (typeof window === 'undefined') {
            return this.getDefaultData();
        }

        const key = dbId || 'default';
        const stored = localStorage.getItem(`${STORAGE_KEY}-${key}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert date strings back to Date objects
            parsed.createdAt = new Date(parsed.createdAt);
            parsed.updatedAt = new Date(parsed.updatedAt);
            parsed.books = parsed.books.map((book: Book) => ({
                ...book,
                createdAt: new Date(book.createdAt),
                updatedAt: new Date(book.updatedAt),
            }));
            parsed.collections = parsed.collections.map((collection: Collection) => ({
                ...collection,
                createdAt: new Date(collection.createdAt),
                updatedAt: new Date(collection.updatedAt),
            }));
            this.data = parsed;
            return parsed;
        }

        // Create new database with the provided ID
        this.data = this.getDefaultData();
        if (dbId) {
            this.data.id = dbId;
        }
        this.saveData(key);
        return this.data;
    }

    // Save data to localStorage
    private saveData(dbId?: string): void {
        if (typeof window !== 'undefined' && this.data) {
            const key = dbId || this.data.id;
            localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(this.data));
        }
    }

    // Create a new database with unique ID
    createNewDatabase(): string {
        let dbId: string;
        let attempts = 0;
        const maxAttempts = 10;

        // Generate a unique ID that doesn't already exist
        do {
            dbId = uuidv4();
            attempts++;
        } while (this.databaseExists(dbId) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique database ID');
        }

        this.data = this.getDefaultData();
        this.data.id = dbId;
        this.saveData(dbId);
        return dbId;
    }

    // Create a database with a specific ID
    createDatabaseWithId(dbId: string): boolean {
        if (this.databaseExists(dbId)) {
            return false; // Database already exists
        }

        this.data = this.getDefaultData();
        this.data.id = dbId;
        this.saveData(dbId);
        return true;
    }

    // Check if a database exists
    databaseExists(dbId: string): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        const stored = localStorage.getItem(`${STORAGE_KEY}-${dbId}`);
        return stored !== null;
    }

    // Books CRUD operations
    getBooks(): Book[] {
        return this.data?.books || [];
    }

    getBook(id: string): Book | undefined {
        return this.data?.books.find((book) => book.id === id);
    }

    addBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
        if (!this.data) throw new Error('Database not initialized');

        const book: Book = {
            ...bookData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.data.books.push(book);
        this.data.updatedAt = new Date();
        this.saveData();
        return book;
    }

    updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Book | null {
        if (!this.data) throw new Error('Database not initialized');

        const bookIndex = this.data.books.findIndex((book) => book.id === id);
        if (bookIndex === -1) return null;

        this.data.books[bookIndex] = {
            ...this.data.books[bookIndex],
            ...updates,
            updatedAt: new Date(),
        };

        this.data.updatedAt = new Date();
        this.saveData();
        return this.data.books[bookIndex];
    }

    deleteBook(id: string): boolean {
        if (!this.data) throw new Error('Database not initialized');

        const initialLength = this.data.books.length;
        this.data.books = this.data.books.filter((book) => book.id !== id);

        if (this.data.books.length < initialLength) {
            this.data.updatedAt = new Date();
            this.saveData();
            return true;
        }
        return false;
    }

    // Collections CRUD operations
    getCollections(): Collection[] {
        return this.data?.collections || [];
    }

    getCollection(id: string): Collection | undefined {
        return this.data?.collections.find((collection) => collection.id === id);
    }

    addCollection(collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Collection {
        if (!this.data) throw new Error('Database not initialized');

        // Check for duplicate collection names
        const existingCollection = this.data.collections.find(
            (collection) => collection.title.toLowerCase().trim() === collectionData.title.toLowerCase().trim()
        );

        if (existingCollection) {
            throw new Error('A collection with this name already exists');
        }

        const collection: Collection = {
            ...collectionData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.data.collections.push(collection);
        this.data.updatedAt = new Date();
        this.saveData();
        return collection;
    }

    updateCollection(id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>): Collection | null {
        if (!this.data) throw new Error('Database not initialized');

        const collectionIndex = this.data.collections.findIndex((collection) => collection.id === id);
        if (collectionIndex === -1) return null;

        // Check for duplicate collection names when updating title
        if (updates.title) {
            const existingCollection = this.data.collections.find(
                (collection) =>
                    collection.id !== id &&
                    collection.title.toLowerCase().trim() === updates.title!.toLowerCase().trim()
            );

            if (existingCollection) {
                throw new Error('A collection with this name already exists');
            }
        }

        this.data.collections[collectionIndex] = {
            ...this.data.collections[collectionIndex],
            ...updates,
            updatedAt: new Date(),
        };

        this.data.updatedAt = new Date();
        this.saveData();
        return this.data.collections[collectionIndex];
    }

    deleteCollection(id: string): boolean {
        if (!this.data) throw new Error('Database not initialized');

        // Don't allow deletion if it's the only collection
        if (this.data.collections.length <= 1) return false;

        // Move all books from this collection to the first remaining collection
        const remainingCollections = this.data.collections.filter((c) => c.id !== id);
        if (remainingCollections.length === 0) return false;

        const defaultCollectionId = remainingCollections[0].id;
        this.data.books = this.data.books.map((book) =>
            book.collectionId === id ? { ...book, collectionId: defaultCollectionId, updatedAt: new Date() } : book
        );

        // Remove the collection
        this.data.collections = remainingCollections;
        this.data.updatedAt = new Date();
        this.saveData();
        return true;
    }

    // Dashboard stats
    getDashboardStats(): DashboardStats {
        const books = this.getBooks();
        const collections = this.getCollections();

        const statusCounts: Record<BookStatus, number> = {
            TBR: 0,
            Reading: 0,
            Read: 0,
            DNF: 0,
            'On Hold': 0,
        };

        books.forEach((book) => {
            statusCounts[book.status]++;
        });

        return {
            totalBooks: books.length,
            collections,
            statusCounts,
        };
    }

    // Get books by collection
    getBooksByCollection(collectionId: string): Book[] {
        return this.getBooks().filter((book) => book.collectionId === collectionId);
    }

    // Get books by status
    getBooksByStatus(status: BookStatus): Book[] {
        return this.getBooks().filter((book) => book.status === status);
    }
}

export const dataService = new DataService();
