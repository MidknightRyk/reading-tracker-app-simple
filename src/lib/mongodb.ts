import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

// Enhanced logging for production debugging
console.log('[MongoDB] Environment:', process.env.NODE_ENV);
console.log('[MongoDB] URI exists:', !!process.env.MONGODB_URI);
console.log('[MongoDB] URI starts with:', process.env.MONGODB_URI?.substring(0, 20) || 'undefined');

if (!process.env.MONGODB_URI) {
    console.error('[MongoDB] CRITICAL: MONGODB_URI is not defined in environment variables');
    throw new Error('Please add your MongoDB URI to .env.local');
}

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

console.log('[MongoDB] Connection options:', JSON.stringify(options, null, 2));

// Add global type declaration
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    console.log('[MongoDB] Running in DEVELOPMENT mode');
    // In development mode, use a global variable so the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        console.log('[MongoDB] Creating new client and connection');
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client
            .connect()
            .then((client) => {
                console.log('[MongoDB] Successfully connected to MongoDB (development)');
                return client;
            })
            .catch((error) => {
                console.error('[MongoDB] Connection error (development):', error);
                throw error;
            });
    } else {
        console.log('[MongoDB] Reusing existing connection');
    }
    clientPromise = global._mongoClientPromise;
} else {
    console.log('[MongoDB] Running in PRODUCTION mode');
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client
        .connect()
        .then((client) => {
            console.log('[MongoDB] Successfully connected to MongoDB (production)');
            return client;
        })
        .catch((error) => {
            console.error('[MongoDB] Connection error (production):', error);
            console.error('[MongoDB] Error details:', JSON.stringify(error, null, 2));
            throw error;
        });
}

export default clientPromise;
