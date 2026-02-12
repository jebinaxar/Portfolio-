import express from "express";
import {
  submitContactRequest,
  getAllContactRequests,
  markContactReviewed
} from "../controllers/contact.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";
import { createMemoryRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();
const contactRateLimit = createMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
  message: "Too many contact submissions. Please wait a minute and try again.",
});

/**
 * PUBLIC
 */
router.post("/", contactRateLimit, submitContactRequest);

/**
 * ADMIN
 */
router.get("/", authenticateAdmin, getAllContactRequests);
router.put("/:id/review", authenticateAdmin, markContactReviewed);

export default router;
