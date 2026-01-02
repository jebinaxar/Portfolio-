import {connectDB} from "../config/db.js";

export const getAdminUsersCollection = async () =>{
    const db = await connectDB();
    return db.collection("adminUsers");
};