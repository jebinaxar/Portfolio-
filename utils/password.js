import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Enforces strong password policy
 * - Min 12 chars
 * - Uppercase
 * - Lowercase
 * - Number
 * - Special character
 */

export const isStrongPassword = (password) => {
    const regex = 
     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

     return regex.test(password);
};

/**
 * Hashes a plain password
 * Never store plain text passwords
 */

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifies password against stored hash
 */
export const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password,hash);
};
