import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DATABASE_NAME } from '@/lib/constants';

export async function GET() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

        const client = await clientPromise;
        console.log('Client connected successfully');

        // Test ping to confirm connection
        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');

        const db = client.db(DATABASE_NAME);
        console.log('Database selected:', db.databaseName);

        // Test creating a simple document to verify write access
        const testCollection = db.collection('connectionTest');
        const testDoc = { test: true, timestamp: new Date() };
        const result = await testCollection.insertOne(testDoc);
        console.log('Test document inserted:', result.insertedId);

        // Clean up test document
        await testCollection.deleteOne({ _id: result.insertedId });
        console.log('Test document cleaned up');

        return NextResponse.json({
            success: true,
            message: 'MongoDB connection successful',
            database: db.databaseName,
            testInsertId: result.insertedId.toString(),
        });
    } catch (error) {
        console.error('MongoDB connection test failed:', error);

        const errorInfo = {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown',
        };

        return NextResponse.json(
            {
                success: false,
                error: 'MongoDB connection failed',
                details: errorInfo,
                mongoUri: process.env.MONGODB_URI ? 'Present' : 'Missing',
            },
            { status: 500 }
        );
    }
}
