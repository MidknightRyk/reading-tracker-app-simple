import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DATABASE_NAME } from '@/lib/constants';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');

        if (!dbId) {
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const collections = await collection.find({ dbId }).toArray();
        // Transform _id to id for frontend compatibility
        const collectionsWithId = collections.map((coll) => ({
            ...coll,
            id: coll._id.toString(),
            _id: undefined,
        }));
        return NextResponse.json(collectionsWithId);
    } catch (error) {
        console.error('GET /api/collections error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        const body = await request.json();

        if (!dbId) {
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const coll = { ...body, dbId };
        const result = await collection.insertOne(coll);
        return NextResponse.json(
            {
                ...coll,
                id: result.insertedId.toString(),
                _id: undefined,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/collections error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

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
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        return NextResponse.json({ ...updates, id: _id, dbId });
    } catch (error) {
        console.error('PUT /api/collections error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

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
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/collections error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
