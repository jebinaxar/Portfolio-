import { hashPassword } from "./utils/password.js";

const run = async () => {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required");
  }

  const hash = await hashPassword(password);
  console.log(hash);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
