import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DATABASE_NAME } from '@/lib/constants';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Books GET ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');

        console.log(`[API Books GET ${requestId}] dbId:`, dbId);

        if (!dbId) {
            console.warn(`[API Books GET ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        console.log(`[API Books GET ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        console.log(`[API Books GET ${requestId}] Connected to MongoDB`);

        const db = client.db(DATABASE_NAME);
        console.log(`[API Books GET ${requestId}] Using database:`, DATABASE_NAME);

        const collection = db.collection('books');
        console.log(`[API Books GET ${requestId}] Querying books collection with dbId:`, dbId);

        const books = await collection.find({ dbId }).toArray();
        console.log(`[API Books GET ${requestId}] Found ${books.length} books`);

        // Transform _id to id for frontend compatibility
        const booksWithId = books.map((book) => ({
            ...book,
            id: book._id.toString(),
            _id: undefined,
        }));

        console.log(`[API Books GET ${requestId}] Returning ${booksWithId.length} books`);
        return NextResponse.json(booksWithId);
    } catch (error) {
        console.error(`[API Books GET ${requestId}] ERROR:`, error);
        console.error(
            `[API Books GET ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Books GET ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Books POST ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        console.log(`[API Books POST ${requestId}] dbId:`, dbId);

        const body = await request.json();
        console.log(`[API Books POST ${requestId}] Body:`, JSON.stringify(body));

        if (!dbId) {
            console.warn(`[API Books POST ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        console.log(`[API Books POST ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        console.log(`[API Books POST ${requestId}] Connected to MongoDB`);

        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        const book = { ...body, dbId };
        console.log(`[API Books POST ${requestId}] Inserting book:`, JSON.stringify(book));

        const result = await collection.insertOne(book);
        console.log(`[API Books POST ${requestId}] Book inserted with ID:`, result.insertedId.toString());

        return NextResponse.json(
            {
                ...book,
                id: result.insertedId.toString(),
                _id: undefined,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(`[API Books POST ${requestId}] ERROR:`, error);
        console.error(
            `[API Books POST ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Books POST ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Books PUT ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        console.log(`[API Books PUT ${requestId}] dbId:`, dbId);

        const body = await request.json();
        console.log(`[API Books PUT ${requestId}] Body:`, JSON.stringify(body));

        if (!dbId) {
            console.warn(`[API Books PUT ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const { _id, ...updates } = body;
        if (!_id) {
            console.warn(`[API Books PUT ${requestId}] Missing _id in body`);
            return NextResponse.json({ error: 'Missing _id for update' }, { status: 400 });
        }

        console.log(`[API Books PUT ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        // Validate ObjectId format
        let objectId;
        try {
            objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
            console.log(`[API Books PUT ${requestId}] Converted to ObjectId:`, objectId);
        } catch (err) {
            console.error(`[API Books PUT ${requestId}] Invalid ObjectId format:`, _id, err);
            return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
        }

        console.log(`[API Books PUT ${requestId}] Updating book with ObjectId:`, objectId.toString());
        const { matchedCount } = await collection.updateOne({ _id: objectId, dbId }, { $set: { ...updates, dbId } });
        console.log(`[API Books PUT ${requestId}] Matched count:`, matchedCount);

        if (matchedCount === 0) {
            console.warn(`[API Books PUT ${requestId}] Book not found`);
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        console.log(`[API Books PUT ${requestId}] Book updated successfully`);
        return NextResponse.json({ ...updates, id: _id, dbId });
    } catch (error) {
        console.error(`[API Books PUT ${requestId}] ERROR:`, error);
        console.error(
            `[API Books PUT ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Books PUT ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Books DELETE ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        console.log(`[API Books DELETE ${requestId}] dbId:`, dbId);

        const body = await request.json();
        console.log(`[API Books DELETE ${requestId}] Body:`, JSON.stringify(body));

        if (!dbId) {
            console.warn(`[API Books DELETE ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const { _id } = body;
        if (!_id) {
            console.warn(`[API Books DELETE ${requestId}] Missing _id in body`);
            return NextResponse.json({ error: 'Missing _id for delete' }, { status: 400 });
        }

        console.log(`[API Books DELETE ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        // Validate ObjectId format
        let objectId;
        try {
            objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
            console.log(`[API Books DELETE ${requestId}] Converted to ObjectId:`, objectId);
        } catch (err) {
            console.error(`[API Books DELETE ${requestId}] Invalid ObjectId format:`, _id, err);
            return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
        }

        console.log(`[API Books DELETE ${requestId}] Deleting book with ObjectId:`, objectId.toString());
        const { deletedCount } = await collection.deleteOne({
            _id: objectId,
            dbId,
        });
        console.log(`[API Books DELETE ${requestId}] Deleted count:`, deletedCount);

        if (deletedCount === 0) {
            console.warn(`[API Books DELETE ${requestId}] Book not found`);
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        console.log(`[API Books DELETE ${requestId}] Book deleted successfully`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[API Books DELETE ${requestId}] ERROR:`, error);
        console.error(
            `[API Books DELETE ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Books DELETE ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
