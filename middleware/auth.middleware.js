import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getAdminUsersCollection } from "../collections/adminUsers.collection.js";

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.adminId || !ObjectId.isValid(decoded.adminId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminUsers = await getAdminUsersCollection();
    const admin = await adminUsers.findOne({ _id: new ObjectId(decoded.adminId) });

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentSessionVersion = admin.sessionVersion || 1;
    if (decoded.sessionVersion !== currentSessionVersion) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = {
      adminId: decoded.adminId,
      accessLevel: decoded.accessLevel,
      sessionVersion: decoded.sessionVersion,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
