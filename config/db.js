import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined in .env");
}

let client;
let db;

export const connectDB = async () => {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  db = client.db("PortfolioCluster");

  console.log("MongoDB connected successfully");
  return db;
};

console.log("Connected to Mongo URI:", process.env.MONGO_URI);

