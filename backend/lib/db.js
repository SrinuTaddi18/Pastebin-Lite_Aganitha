import { MongoClient } from "mongodb";

function getClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (global._mongoClientPromise) {
    return global._mongoClientPromise;
  }
  global._mongoClientPromise = new MongoClient(uri).connect();
  return global._mongoClientPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db();
}

export async function healthCheck() {
  if (!process.env.MONGODB_URI) return false;
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
