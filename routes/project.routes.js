import express from "express";
import {
  createProject,
  updateProject,
  publishProject,
  getPublishedProjects,
  getPublicProjectById,
  submitForReview,
  archiveProject,
  restoreProject,
  getAllProjectsAdmin,
  getDraftProjectsAdmin
} from "../controllers/project.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();



/**
 * ADMIN VIEWS
 */
router.get("/admin/all", authenticateAdmin, getAllProjectsAdmin);
router.get("/admin/drafts", authenticateAdmin, getDraftProjectsAdmin);




/**
 * PUBLIC ROUTES
 * Only published projects are visible
 */
router.get("/public", getPublishedProjects);
router.get("/public/:id", getPublicProjectById);

/**
 * ADMIN ROUTES
 * All protected
 */
router.post("/", authenticateAdmin, createProject);
router.put("/:id", authenticateAdmin, updateProject);

router.post("/:id/review", authenticateAdmin, submitForReview);
router.post("/:id/publish", authenticateAdmin, publishProject);
router.post("/:id/archive", authenticateAdmin, archiveProject);
router.post("/:id/restore", authenticateAdmin, restoreProject);

export default router;
