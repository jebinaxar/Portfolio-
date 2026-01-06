import express from "express";
import {
  createProject,
  updateProject,
  submitForReview,
  publishProject,
  archiveProject,
  getPublishedProjects
} from "../controllers/project.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * PUBLIC ROUTES
 * Only published projects are visible
 */
router.get("/public", getPublishedProjects);

/**
 * ADMIN ROUTES
 * All protected
 */
router.post("/", authenticateAdmin, createProject);
router.put("/:id", authenticateAdmin, updateProject);

router.post("/:id/review", authenticateAdmin, submitForReview);
router.post("/:id/publish", authenticateAdmin, publishProject);
router.post("/:id/archive", authenticateAdmin, archiveProject);

export default router;
