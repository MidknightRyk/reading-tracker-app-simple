import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DATABASE_NAME } from '@/lib/constants';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Collections GET ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');

        console.log(`[API Collections GET ${requestId}] dbId:`, dbId);

        if (!dbId) {
            console.warn(`[API Collections GET ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        console.log(`[API Collections GET ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        console.log(`[API Collections GET ${requestId}] Connected to MongoDB`);

        const db = client.db(DATABASE_NAME);
        console.log(`[API Collections GET ${requestId}] Using database:`, DATABASE_NAME);

        const collection = db.collection('collections');
        console.log(`[API Collections GET ${requestId}] Querying collections with dbId:`, dbId);

        const collections = await collection.find({ dbId }).toArray();
        console.log(`[API Collections GET ${requestId}] Found ${collections.length} collections`);

        // Transform _id to id for frontend compatibility
        const collectionsWithId = collections.map((coll) => ({
            ...coll,
            id: coll._id.toString(),
            _id: undefined,
        }));

        console.log(`[API Collections GET ${requestId}] Returning ${collectionsWithId.length} collections`);
        return NextResponse.json(collectionsWithId);
    } catch (error) {
        console.error(`[API Collections GET ${requestId}] ERROR:`, error);
        console.error(
            `[API Collections GET ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Collections GET ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Collections POST ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        console.log(`[API Collections POST ${requestId}] dbId:`, dbId);

        const body = await request.json();
        console.log(`[API Collections POST ${requestId}] Body:`, JSON.stringify(body));

        if (!dbId) {
            console.warn(`[API Collections POST ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        console.log(`[API Collections POST ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        console.log(`[API Collections POST ${requestId}] Connected to MongoDB`);

        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

        const coll = { ...body, dbId };
        console.log(`[API Collections POST ${requestId}] Inserting collection:`, JSON.stringify(coll));

        const result = await collection.insertOne(coll);
        console.log(`[API Collections POST ${requestId}] Collection inserted with ID:`, result.insertedId.toString());

        return NextResponse.json(
            {
                ...coll,
                id: result.insertedId.toString(),
                _id: undefined,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(`[API Collections POST ${requestId}] ERROR:`, error);
        console.error(
            `[API Collections POST ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Collections POST ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Collections PUT ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        console.log(`[API Collections PUT ${requestId}] dbId:`, dbId);

        const body = await request.json();
        console.log(`[API Collections PUT ${requestId}] Body:`, JSON.stringify(body));

        if (!dbId) {
            console.warn(`[API Collections PUT ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const { _id, ...updates } = body;
        if (!_id) {
            console.warn(`[API Collections PUT ${requestId}] Missing _id in body`);
            return NextResponse.json({ error: 'Missing _id for update' }, { status: 400 });
        }

        console.log(`[API Collections PUT ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

        // Validate ObjectId format
        let objectId;
        try {
            objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
            console.log(`[API Collections PUT ${requestId}] Converted to ObjectId:`, objectId);
        } catch (err) {
            console.error(`[API Collections PUT ${requestId}] Invalid ObjectId format:`, _id, err);
            return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
        }

        console.log(`[API Collections PUT ${requestId}] Updating collection with ObjectId:`, objectId.toString());
        const { matchedCount } = await collection.updateOne({ _id: objectId, dbId }, { $set: { ...updates, dbId } });
        console.log(`[API Collections PUT ${requestId}] Matched count:`, matchedCount);

        if (matchedCount === 0) {
            console.warn(`[API Collections PUT ${requestId}] Collection not found`);
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        console.log(`[API Collections PUT ${requestId}] Collection updated successfully`);
        return NextResponse.json({ ...updates, id: _id, dbId });
    } catch (error) {
        console.error(`[API Collections PUT ${requestId}] ERROR:`, error);
        console.error(
            `[API Collections PUT ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Collections PUT ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Collections DELETE ${requestId}] Request received`);

    try {
        const { searchParams } = new URL(request.url);
        const dbId = searchParams.get('dbId');
        console.log(`[API Collections DELETE ${requestId}] dbId:`, dbId);

        const body = await request.json();
        console.log(`[API Collections DELETE ${requestId}] Body:`, JSON.stringify(body));

        if (!dbId) {
            console.warn(`[API Collections DELETE ${requestId}] Missing dbId parameter`);
            return NextResponse.json({ error: 'dbId is required as a query parameter' }, { status: 400 });
        }

        const { _id } = body;
        if (!_id) {
            console.warn(`[API Collections DELETE ${requestId}] Missing _id in body`);
            return NextResponse.json({ error: 'Missing _id for delete' }, { status: 400 });
        }

        console.log(`[API Collections DELETE ${requestId}] Connecting to MongoDB...`);
        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const collection = db.collection('collections');

        // Validate ObjectId format
        let objectId;
        try {
            objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
            console.log(`[API Collections DELETE ${requestId}] Converted to ObjectId:`, objectId);
        } catch (err) {
            console.error(`[API Collections DELETE ${requestId}] Invalid ObjectId format:`, _id, err);
            return NextResponse.json({ error: 'Invalid _id format' }, { status: 400 });
        }

        console.log(`[API Collections DELETE ${requestId}] Deleting collection with ObjectId:`, objectId.toString());
        const { deletedCount } = await collection.deleteOne({
            _id: objectId,
            dbId,
        });
        console.log(`[API Collections DELETE ${requestId}] Deleted count:`, deletedCount);

        if (deletedCount === 0) {
            console.warn(`[API Collections DELETE ${requestId}] Collection not found`);
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        console.log(`[API Collections DELETE ${requestId}] Collection deleted successfully`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[API Collections DELETE ${requestId}] ERROR:`, error);
        console.error(
            `[API Collections DELETE ${requestId}] Error stack:`,
            error instanceof Error ? error.stack : 'No stack trace'
        );
        console.error(`[API Collections DELETE ${requestId}] Error details:`, JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
