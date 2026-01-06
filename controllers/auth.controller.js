import { getAdminUsersCollection } from "../collections/adminUsers.collection.js";
import { verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Authenticates admin credentials
 * Returns JWT if successful
 */
export const loginAdmin = async (email, password) => {
  // 1. Basic validation
  if (!email || !password) {
    throw new Error("Missing credentials");
  }

  // 2. Fetch admin user
  const adminUsers = await getAdminUsersCollection();
  const admin = await adminUsers.findOne({ email });

  // 3. Generic failure
  if (!admin) {
    throw new Error("Invalid credentials");
  }

  // 4. Verify password
  const isPasswordValid = await verifyPassword(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // 5. Generate JWT
  const token = generateToken({
    adminId: admin._id.toString(),
    accessLevel: "FULL",
    sessionVersion: newSessionVersion
  });

// 6 Increment session version (invalidate old sessions)
const newSessionVersion = (admin.sessionVersion || 1) + 1;

await adminUsers.updateOne(
  { _id: admin._id },
  { $set: { sessionVersion: newSessionVersion } }
);

  // 7. Return token to route layer
  return token;
};
