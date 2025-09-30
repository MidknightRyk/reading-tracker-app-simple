export type BookStatus = 'TBR' | 'Reading' | 'Read' | 'DNF' | 'On Hold';

export interface Book {
    id: string;
    title: string;
    author: string;
    review?: string;
    rating: number; // 0-5
    status: BookStatus;
    collectionId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Collection {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Database {
    id: string;
    books: Book[];
    collections: Collection[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardStats {
    totalBooks: number;
    collections: Collection[];
    statusCounts: Record<BookStatus, number>;
}
