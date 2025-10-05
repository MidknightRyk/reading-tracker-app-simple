import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Book, Collection, BookStatus, DashboardStats } from '@/types';
import { DEFAULT_COLLECTION_NAME, DEFAULT_COLLECTION_DESCRIPTION } from '@/lib/constants';

class MongoDataService {
    private currentDbId: string | null = null;

    // Initialize and check if database exists
    async loadData(dbId: string): Promise<void> {
        this.currentDbId = dbId;
        // No need to explicitly check existence for MongoDB - will return empty arrays if no data
    }

    // Create a new database with unique ID
    async createNewDatabase(): Promise<string> {
        const dbId = uuidv4();
        this.currentDbId = dbId;

        // Create default collection for new database
        const defaultCollection = {
            title: DEFAULT_COLLECTION_NAME,
            description: DEFAULT_COLLECTION_DESCRIPTION,
        };

        // Add the default collection to the new database
        await this.addCollection(defaultCollection);
        return dbId;
    }

    // Create a database with a specific ID
    async createDatabaseWithId(dbId: string): Promise<boolean> {
        const exists = await this.databaseExists(dbId);
        if (exists) {
            return false;
        }

        this.currentDbId = dbId;

        // Create default collection for new database
        const defaultCollection = {
            title: DEFAULT_COLLECTION_NAME,
            description: DEFAULT_COLLECTION_DESCRIPTION,
        };

        await this.addCollection(defaultCollection);
        return true;
    }

    // Check if a database exists
    async databaseExists(dbId: string): Promise<boolean> {
        try {
            const books = await this.getBooks(dbId);
            const collections = await this.getCollections(dbId);
            return books.length > 0 || collections.length > 0;
        } catch {
            return false;
        }
    }

    // Books CRUD operations
    async getBooks(dbId?: string): Promise<Book[]> {
        const id = dbId || this.currentDbId;
        if (!id) throw new Error('Database not initialized');
        const res = await axios.get('/api/books', { params: { dbId: id } });
        return res.data;
    }

    async getBook(id: string): Promise<Book | undefined> {
        if (!this.currentDbId) throw new Error('Database not initialized');
        const books = await this.getBooks();
        return books.find((book) => book.id === id);
    }

    async addBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
        if (!this.currentDbId) throw new Error('Database not initialized');
        const book = {
            ...bookData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const res = await axios.post(`/api/books?dbId=${this.currentDbId}`, book);
        return res.data;
    }

    async updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Promise<Book | null> {
        if (!this.currentDbId) throw new Error('Database not initialized');
        try {
            const res = await axios.put(`/api/books?dbId=${this.currentDbId}`, {
                _id: id,
                ...updates,
                updatedAt: new Date(),
            });
            return res.data;
        } catch {
            return null;
        }
    }

    async deleteBook(id: string): Promise<boolean> {
        if (!this.currentDbId) throw new Error('Database not initialized');
        try {
            await axios.delete(`/api/books?dbId=${this.currentDbId}`, { data: { _id: id } });
            return true;
        } catch {
            return false;
        }
    }

    // Collections CRUD operations
    async getCollections(dbId?: string): Promise<Collection[]> {
        const id = dbId || this.currentDbId;
        if (!id) throw new Error('Database not initialized');
        const res = await axios.get('/api/collections', { params: { dbId: id } });
        return res.data;
    }

    async getCollection(id: string): Promise<Collection | undefined> {
        if (!this.currentDbId) throw new Error('Database not initialized');
        const collections = await this.getCollections();
        return collections.find((collection) => collection.id === id);
    }

    async addCollection(collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection> {
        if (!this.currentDbId) throw new Error('Database not initialized');

        // Check for duplicate collection names
        const collections = await this.getCollections();
        const existingCollection = collections.find(
            (collection) => collection.title.toLowerCase().trim() === collectionData.title.toLowerCase().trim()
        );

        if (existingCollection) {
            throw new Error('A collection with this name already exists');
        }

        const collection = {
            ...collectionData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const res = await axios.post(`/api/collections?dbId=${this.currentDbId}`, collection);
        return res.data;
    }

    async updateCollection(
        id: string,
        updates: Partial<Omit<Collection, 'id' | 'createdAt'>>
    ): Promise<Collection | null> {
        if (!this.currentDbId) throw new Error('Database not initialized');

        // Check for duplicate collection names when updating title
        if (updates.title) {
            const collections = await this.getCollections();
            const existingCollection = collections.find(
                (collection) =>
                    collection.id !== id &&
                    collection.title.toLowerCase().trim() === updates.title!.toLowerCase().trim()
            );

            if (existingCollection) {
                throw new Error('A collection with this name already exists');
            }
        }

        try {
            const res = await axios.put(`/api/collections?dbId=${this.currentDbId}`, {
                _id: id,
                ...updates,
                updatedAt: new Date(),
            });
            return res.data;
        } catch {
            return null;
        }
    }

    async deleteCollection(id: string): Promise<boolean> {
        if (!this.currentDbId) throw new Error('Database not initialized');

        const collections = await this.getCollections();

        // Don't allow deletion if it's the only collection
        if (collections.length <= 1) return false;

        // Move all books from this collection to the first remaining collection
        const remainingCollections = collections.filter((c) => c.id !== id);
        if (remainingCollections.length === 0) return false;

        const defaultCollectionId = remainingCollections[0].id;
        const books = await this.getBooks();
        const booksToMove = books.filter((book) => book.collectionId === id);

        // Update all books in this collection to move to the default collection
        for (const book of booksToMove) {
            await this.updateBook(book.id, { collectionId: defaultCollectionId });
        }

        try {
            await axios.delete(`/api/collections?dbId=${this.currentDbId}`, { data: { _id: id } });
            return true;
        } catch {
            return false;
        }
    }

    // Dashboard stats
    async getDashboardStats(): Promise<DashboardStats> {
        if (!this.currentDbId) throw new Error('Database not initialized');

        const books = await this.getBooks();
        const collections = await this.getCollections();

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
    async getBooksByCollection(collectionId: string): Promise<Book[]> {
        const books = await this.getBooks();
        return books.filter((book) => book.collectionId === collectionId);
    }

    // Get books by status
    async getBooksByStatus(status: BookStatus): Promise<Book[]> {
        const books = await this.getBooks();
        return books.filter((book) => book.status === status);
    }
}

export const mongoDataService = new MongoDataService();
