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
      clientApproved: false,
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
    const project = await projects.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== PROJECT_STATUS.DRAFT) {
      return res.status(400).json({
        message: "Only DRAFT projects can be edited"
      });
    }

    await projects.updateOne(
      { _id: project._id },
      {
        $set: {
          title: title ?? project.title,
          description: description ?? project.description,
          techStack: Array.isArray(techStack) ? techStack : project.techStack,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({ message: "Project updated" });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Submit a project for review (DRAFT → REVIEW)
 */
export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await getProjectsCollection();
    const project = await projects.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== PROJECT_STATUS.DRAFT) {
      return res.status(400).json({
        message: "Only DRAFT projects can be submitted for review"
      });
    }

    await projects.updateOne(
      { _id: project._id },
      {
        $set: {
          status: PROJECT_STATUS.REVIEW,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({ message: "Project submitted for review" });
  } catch (error) {
    console.error("Submit for review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Publish a project (REVIEW → PUBLISHED)
 */
export const publishProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await getProjectsCollection();
    const project = await projects.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== PROJECT_STATUS.REVIEW) {
      return res.status(400).json({
        message: "Only REVIEW projects can be published"
      });
    }

    await projects.updateOne(
      { _id: project._id },
      {
        $set: {
          status: PROJECT_STATUS.PUBLISHED,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({ message: "Project published" });
  } catch (error) {
    console.error("Publish project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Archive a project (PUBLISHED → ARCHIVED)
 */
export const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await getProjectsCollection();
    const project = await projects.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== PROJECT_STATUS.PUBLISHED) {
      return res.status(400).json({
        message: "Only PUBLISHED projects can be archived"
      });
    }

    await projects.updateOne(
      { _id: project._id },
      {
        $set: {
          status: PROJECT_STATUS.ARCHIVED,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({ message: "Project archived" });
  } catch (error) {
    console.error("Archive project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Public: Get all published projects
 */
export const getPublishedProjects = async (req, res) => {
  try {
    const projects = await getProjectsCollection();

    const data = await projects
      .find({ status: PROJECT_STATUS.PUBLISHED })
      .sort({ createdAt: -1 })
      .limit(12)
      .toArray();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Public projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



/**
 * Admin: Get all projects (draft + published)
 */
export const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await getProjectsCollection();

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await projects.countDocuments();

    const data = await projects
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

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

    const drafts = await projects
.find({ status: PROJECT_STATUS.DRAFT })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: drafts
    });
  } catch (error) {
    console.error("Admin get draft projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
