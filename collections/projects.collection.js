import { connectDB } from "../config/db.js";

export const getProjectsCollection = async () => {
  const db = await connectDB();
  return db.collection("projects");
};
