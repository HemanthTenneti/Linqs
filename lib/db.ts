import { MongoClient } from "mongodb";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Native MongoClient for Auth.js Adapter ───
// Auth.js expects a raw MongoClient instance (not a Mongoose connection)
// so we maintain a separate client just for the adapter layer
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, reuse the connection across HMR reloads via a global variable
  // otherwise every file change would open a new connection pool
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Production: one connection per process
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;

// ─── Mongoose Connection for Application Models ───
// Mongoose gives us schema validation, middleware, and type safety
// that the raw MongoClient doesn't provide
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as typeof globalThis & {
  mongoose?: MongooseCache;
}).mongoose as MongooseCache;

if (!cached) {
  cached = { conn: null, promise: null };
  (global as typeof globalThis & { mongoose?: MongooseCache }).mongoose = cached;
}

export async function connectMongoose(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn as unknown as typeof mongoose;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
    return mongooseInstance;
  } catch (error) {
    // Reset the promise so the next attempt can retry
    cached.promise = null;
    throw error;
  }
}
