import jwt from 'jsonwebtoken';

/**
 * Generates a short-lived JWT
 * @param {Object} payload - minimal identity data
 */
export const generateToken = (payload) => {
    return  jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn:"15m"
    });
};