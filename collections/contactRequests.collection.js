import { connectDB } from "../config/db.js";

export const getContactRequestsCollection = async () => {
  const db = await connectDB();
  return db.collection("contactRequests");
};
