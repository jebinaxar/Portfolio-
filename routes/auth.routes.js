import express from "express";
import { loginAdmin } from "../controllers/auth.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * POST /auth/login
 * Sets httpOnly JWT cookie on success
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await loginAdmin(email, password);

    // Set secure, short-lived cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

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

export default router;
