// Run this script in your MongoDB playground or with node after setting up your connection string.
// It will create a books collection with a sample dbId and a few books matching your app's expected schema.

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://marishkanmagness_db_user:R62yOKnQL8964hVx@cluster0.mongodb.net/simpleReaderApp?retryWrites=true&w=majority';
const dbName = 'simpleReaderApp';
const dbId = 'demo-db-123'; // Change this to test with your own dbId

const books = [
  {
    dbId,
    id: 'book-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    rating: 5,
    status: 'Read',
    collectionId: 'collection-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    dbId,
    id: 'book-2',
    title: 'Atomic Habits',
    author: 'James Clear',
    rating: 4,
    status: 'Reading',
    collectionId: 'collection-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const booksCol = db.collection('books');
    await booksCol.deleteMany({ dbId });
    await booksCol.insertMany(books);
    console.log('Seeded books for dbId:', dbId);
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
