import mongoose from "mongoose";
import { getDatabaseConfigurationError } from "@/lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  const configurationError = getDatabaseConfigurationError();

  if (!mongoUri || configurationError) {
    throw new Error(configurationError ?? "Missing MONGODB_URI environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
