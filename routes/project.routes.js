import express from "express";
import {
  createProject,
  updateProject,
  publishProject,
  getPublishedProjects,
  approveProjectByClient
} from "../controllers/project.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * PUBLIC ROUTES
 * Anyone can view published projects
 */
router.get("/", getPublishedProjects);

/**
 * ADMIN ROUTES
 * Protected by authentication middleware
 */
router.post("/", authenticateAdmin, createProject);
router.put("/:id", authenticateAdmin, updateProject);
router.post("/:id/publish", authenticateAdmin, publishProject);
router.post("/:id/approve", authenticateAdmin, approveProjectByClient);


export default router;
