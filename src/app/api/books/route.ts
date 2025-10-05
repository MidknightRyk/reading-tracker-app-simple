import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DATABASE_NAME } from '@/lib/constants';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');

        if (!dbId) {
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const books = await collection.find({ dbId }).toArray();
        // Transform _id to id for frontend compatibility
        const booksWithId = books.map((book) => ({
            ...book,
            id: book._id.toString(),
            _id: undefined,
        }));
        return NextResponse.json(booksWithId);
    } catch (error) {
        console.error('GET /api/books error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        const body = await request.json();

        if (!dbId) {
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const book = { ...body, dbId };
        const result = await collection.insertOne(book);
        return NextResponse.json(
            {
                ...book,
                id: result.insertedId.toString(),
                _id: undefined,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/books error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        const body = await request.json();

        if (!dbId) {
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const { _id, ...updates } = body;
        if (!_id) {
            return NextResponse.json({ error: 'Missing _id for update' }, { status: 400 });
        }

        // Validate ObjectId format
        let objectId;
        try {
            objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
        } catch {
            return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
        }

        const { matchedCount } = await collection.updateOne({ _id: objectId, dbId }, { $set: { ...updates, dbId } });

        if (matchedCount === 0) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ ...updates, id: _id, dbId });
    } catch (error) {
        console.error('PUT /api/books error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('books');

        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        const body = await request.json();

        if (!dbId) {
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const { _id } = body;
        if (!_id) {
            return NextResponse.json({ error: 'Missing _id for delete' }, { status: 400 });
        }

        // Validate ObjectId format
        let objectId;
        try {
            objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
        } catch {
            return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
        }

        const { deletedCount } = await collection.deleteOne({
            _id: objectId,
            dbId,
        });

        if (deletedCount === 0) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/books error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
