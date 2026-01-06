import bcrypt from "bcrypt";

const password = "Admin@12345"; // EXACT password you use in Postman
const SALT_ROUNDS = 12;

const run = async () => {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log(hash);
};

run();
