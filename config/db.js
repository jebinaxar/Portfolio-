import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "PortfolioCluster";

if (!uri) {
  throw new Error("MONGO_URI is not defined in .env");
}

let client;
let db;

export const connectDB = async () => {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);

  console.log(`MongoDB connected successfully (${dbName})`);
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};
