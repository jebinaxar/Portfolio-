import { connectDB } from "../config/db.js";

export const getAnalyticsEventsCollection = async () => {
  const db = await connectDB();
  return db.collection("analyticsEvents");
};
