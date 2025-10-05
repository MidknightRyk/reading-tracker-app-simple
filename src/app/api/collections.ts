import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('collections');

    // Extract dbId from query parameters
    const { dbId } = req.query;

    if (!dbId || typeof dbId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid dbId parameter' });
        return;
    }

    switch (req.method) {
        case 'GET': {
            const collections = await collection.find({ dbId }).toArray();
            res.status(200).json(collections);
            break;
        }
        case 'POST': {
            const coll = { ...req.body, dbId };
            const result = await collection.insertOne(coll);
            res.status(201).json({ ...coll, _id: result.insertedId });
            break;
        }
        case 'PUT': {
            const { _id, ...updates } = req.body;
            if (!_id) {
                res.status(400).json({ error: 'Missing _id for update' });
                break;
            }
            const { matchedCount } = await collection.updateOne(
                { _id: typeof _id === 'string' ? new ObjectId(_id) : _id, dbId },
                { $set: { ...updates, dbId } }
            );
            if (matchedCount === 0) {
                res.status(404).json({ error: 'Collection not found' });
            } else {
                res.status(200).json({ ...updates, _id, dbId });
            }
            break;
        }
        case 'DELETE': {
            const { _id } = req.body;
            if (!_id) {
                res.status(400).json({ error: 'Missing _id for delete' });
                break;
            }
            const { deletedCount } = await collection.deleteOne({
                _id: typeof _id === 'string' ? new ObjectId(_id) : _id,
                dbId,
            });
            if (deletedCount === 0) {
                res.status(404).json({ error: 'Collection not found' });
            } else {
                res.status(200).json({ success: true });
            }
            break;
        }
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
