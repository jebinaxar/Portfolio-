import { ObjectId } from "mongodb";
import { getProjectsCollection } from "../collections/projects.collection.js";

/**
 * Canonical project states
 * Single source of truth
 */
const PROJECT_STATUS = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
};

/**
 * Admin: Create a new project (always DRAFT)
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, techStack } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const projects = await getProjectsCollection();
    const now = new Date();

    const project = {
      title,
      description,
      techStack: Array.isArray(techStack) ? techStack : [],
      status: PROJECT_STATUS.DRAFT,
      clientApproved: false, // retained but unused
      createdAt: now,
      updatedAt: now
    };

    const result = await projects.insertOne(project);

    return res.status(201).json({
      message: "Project created as DRAFT",
      projectId: result.insertedId
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Update a project (ONLY when DRAFT)
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, techStack } = req.body;

    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      {
        _id: new ObjectId(id),
        status: PROJECT_STATUS.DRAFT
      },
      {
        $set: {
          title,
          description,
          techStack: Array.isArray(techStack) ? techStack : [],
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "Only DRAFT projects can be edited"
      });
    }

    return res.status(200).json({ message: "Project updated" });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Submit a project for review (DRAFT → REVIEW)
 * Atomic & idempotent
 */
export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      {
        _id: new ObjectId(id),
        status: PROJECT_STATUS.DRAFT
      },
      {
        $set: {
          status: PROJECT_STATUS.REVIEW,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "Project is not in DRAFT state"
      });
    }

    return res.status(200).json({ message: "Project submitted for review" });
  } catch (error) {
    console.error("Submit for review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Publish a project (REVIEW → PUBLISHED)
 * Atomic & idempotent
 */
export const publishProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      {
        _id: new ObjectId(id),
        status: PROJECT_STATUS.REVIEW
      },
      {
        $set: {
          status: PROJECT_STATUS.PUBLISHED,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "Project is not in REVIEW state"
      });
    }

    return res.status(200).json({ message: "Project published" });
  } catch (error) {
    console.error("Publish project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Archive a project (PUBLISHED → ARCHIVED)
 * Atomic & irreversible
 */
export const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      {
        _id: new ObjectId(id),
        status: PROJECT_STATUS.PUBLISHED
      },
      {
        $set: {
          status: PROJECT_STATUS.ARCHIVED,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "Project is not in PUBLISHED state"
      });
    }

    return res.status(200).json({ message: "Project archived" });
  } catch (error) {
    console.error("Archive project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Public: Get published projects (capped)
 */
export const getPublishedProjects = async (req, res) => {
  try {
    const projects = await getProjectsCollection();
const data = await projects
  .find({ status: PROJECT_STATUS.PUBLISHED })
  .sort({ createdAt: -1 })
  .limit(12)
  .toArray();

const publicProjects = data.map(p => ({
  id: p._id.toString(),
  title: p.title,
  description: p.description,
  techStack: p.techStack,
  createdAt: p.createdAt
}));

return res.status(200).json({
  success: true,
  data: publicProjects
});

  } catch (error) {
    console.error("Public projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Get all projects (paginated)
 */
export const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await getProjectsCollection();

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await projects.countDocuments();

    const rawProjects = await projects
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const data = rawProjects.map(p => ({
      id: p._id.toString(),
      title: p.title,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return res.status(200).json({
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data
    });
  } catch (error) {
    console.error("Admin pagination error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Get only draft projects
 */
export const getDraftProjectsAdmin = async (req, res) => {
  try {
    const projects = await getProjectsCollection();

    const rawDrafts = await projects
      .find({ status: PROJECT_STATUS.DRAFT })
      .sort({ createdAt: -1 })
      .toArray();

    const data = rawDrafts.map(p => ({
      id: p._id.toString(),
      title: p.title,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Admin get draft projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
