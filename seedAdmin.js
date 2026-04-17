import { getAdminUsersCollection } from "./collections/adminUsers.collection.js";
import { hashPassword } from "./utils/password.js";

const run = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const adminUsers = await getAdminUsersCollection();
  const passwordHash = await hashPassword(password);

  const result = await adminUsers.updateOne(
    { email },
    {
      $set: {
        email,
        passwordHash,
      },
      $setOnInsert: {
        sessionVersion: 1,
        createdAt: new Date(),
      },
      $currentDate: {
        updatedAt: true,
      },
    },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    console.log(`Admin user created for ${email}`);
    return;
  }

  console.log(`Admin user updated for ${email}`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
