import jwt from "jsonwebtoken";

/**
 * Protects routes by verifying JWT from httpOnly cookie
 */
export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach identity to request
    req.admin = {
      adminId: decoded.adminId,
      accessLevel: decoded.accessLevel
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
