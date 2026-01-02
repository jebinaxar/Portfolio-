import express from "express";
import {
  submitContactRequest,
  getAllContactRequests,
  markContactReviewed
} from "../controllers/contact.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * PUBLIC
 */
router.post("/", submitContactRequest);

/**
 * ADMIN
 */
router.get("/", authenticateAdmin, getAllContactRequests);
router.put("/:id/review", authenticateAdmin, markContactReviewed);

export default router;
