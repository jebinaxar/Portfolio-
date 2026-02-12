import express from "express";
import { loginAdmin } from "../controllers/auth.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

/**
 * POST /auth/login
 * Sets httpOnly JWT cookie on success
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await loginAdmin(email, password);
    res.cookie("access_token", token, getCookieOptions());

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
});

router.get("/me", authenticateAdmin, (req, res) => {
  return res.status(200).json({
    message: "Authenticated",
    admin: req.admin,
  });
});

router.post("/logout", (req, res) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie("access_token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    domain: cookieOptions.domain,
  });

  return res.status(200).json({ message: "Logout successful" });
});

export default router;
