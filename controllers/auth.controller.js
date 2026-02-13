import { getAdminUsersCollection } from "../collections/adminUsers.collection.js";
import { verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import {
  getNextSessionVersion,
  validateAuthCredentialsInput,
} from "../services/auth.service.js";

/**
 * Authenticates admin credentials
 * Returns JWT if successful
 */
export const loginAdmin = async (email, password) => {
  if (!validateAuthCredentialsInput(email, password)) {
    throw new Error("Missing credentials");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Missing credentials");
  }

  const adminUsers = await getAdminUsersCollection();
  const admin = await adminUsers.findOne({ email: normalizedEmail });

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await verifyPassword(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const newSessionVersion = getNextSessionVersion(admin.sessionVersion);

  await adminUsers.updateOne(
    { _id: admin._id },
    { $set: { sessionVersion: newSessionVersion } }
  );

  const token = generateToken({
    adminId: admin._id.toString(),
    accessLevel: "FULL",
    sessionVersion: newSessionVersion,
  });

  return token;
};
