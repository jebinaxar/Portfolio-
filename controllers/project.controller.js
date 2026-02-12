import { ObjectId } from "mongodb";
import { getProjectsCollection } from "../collections/projects.collection.js";
import {
  canTransitionProjectStatus,
  PROJECT_STATUS,
} from "../services/projectWorkflow.service.js";

const mapProjectSummary = (p) => ({
  id: p._id.toString(),
  title: p.title,
  status: p.status,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

const mapPublicProject = (p) => ({
  id: p._id.toString(),
  title: p.title,
  description: p.description,
  techStack: Array.isArray(p.techStack) ? p.techStack : [],
  imageUrl: p.imageUrl || "",
  createdAt: p.createdAt,
});

/**
 * Admin: Create a new project (always DRAFT)
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, imageUrl, problem, approach, impact, links } =
      req.body || {};

    if (!title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const projects = await getProjectsCollection();
    const now = new Date();

    const project = {
      title: String(title).trim(),
      description: String(description).trim(),
      techStack: Array.isArray(techStack) ? techStack : [],
      imageUrl: imageUrl || "",
      problem: problem || "",
      approach: approach || "",
      impact: impact || "",
      links:
        typeof links === "object" && links
          ? {
              live: links.live || "",
              github: links.github || "",
            }
          : { live: "", github: "" },
      status: PROJECT_STATUS.DRAFT,
      createdAt: now,
      updatedAt: now,
    };

    const result = await projects.insertOne(project);

    return res.status(201).json({
      message: "Project created as DRAFT",
      projectId: result.insertedId,
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
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const { title, description, techStack, imageUrl, problem, approach, impact, links } =
      req.body || {};
    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      {
        _id: new ObjectId(id),
        status: PROJECT_STATUS.DRAFT,
      },
      {
        $set: {
          ...(title ? { title: String(title).trim() } : {}),
          ...(description ? { description: String(description).trim() } : {}),
          ...(Array.isArray(techStack) ? { techStack } : {}),
          ...(typeof imageUrl === "string" ? { imageUrl } : {}),
          ...(typeof problem === "string" ? { problem } : {}),
          ...(typeof approach === "string" ? { approach } : {}),
          ...(typeof impact === "string" ? { impact } : {}),
          ...(typeof links === "object" && links
            ? { links: { live: links.live || "", github: links.github || "" } }
            : {}),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "Only DRAFT projects can be edited",
      });
    }

    return res.status(200).json({ message: "Project updated" });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const transitionProjectStatus = async (id, fromStatus, toStatus) => {
  if (!canTransitionProjectStatus(fromStatus, toStatus)) {
    throw new Error(`Invalid status transition: ${fromStatus} -> ${toStatus}`);
  }

  const projects = await getProjectsCollection();

  return projects.updateOne(
    {
      _id: new ObjectId(id),
      status: fromStatus,
    },
    {
      $set: {
        status: toStatus,
        updatedAt: new Date(),
      },
    }
  );
};

export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const result = await transitionProjectStatus(
      id,
      PROJECT_STATUS.DRAFT,
      PROJECT_STATUS.REVIEW
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({ message: "Project is not in DRAFT state" });
    }

    return res.status(200).json({ message: "Project submitted for review" });
  } catch (error) {
    console.error("Submit for review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const publishProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const result = await transitionProjectStatus(
      id,
      PROJECT_STATUS.REVIEW,
      PROJECT_STATUS.PUBLISHED
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({ message: "Project is not in REVIEW state" });
    }

    return res.status(200).json({ message: "Project published" });
  } catch (error) {
    console.error("Publish project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const result = await transitionProjectStatus(
      id,
      PROJECT_STATUS.PUBLISHED,
      PROJECT_STATUS.ARCHIVED
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({ message: "Project is not in PUBLISHED state" });
    }

    return res.status(200).json({ message: "Project archived" });
  } catch (error) {
    console.error("Archive project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const restoreProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const result = await transitionProjectStatus(
      id,
      PROJECT_STATUS.ARCHIVED,
      PROJECT_STATUS.DRAFT
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({ message: "Project is not in ARCHIVED state" });
    }

    return res.status(200).json({ message: "Project restored to DRAFT" });
  } catch (error) {
    console.error("Restore project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Public: list published projects
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
      data: data.map(mapPublicProject),
    });
  } catch (error) {
    console.error("Public projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Public: get one published project detail
 */
export const getPublicProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const projects = await getProjectsCollection();
    const project = await projects.findOne({
      _id: new ObjectId(id),
      status: PROJECT_STATUS.PUBLISHED,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...mapPublicProject(project),
        problem: project.problem || "",
        approach: project.approach || "",
        impact: project.impact || "",
        links: {
          live: project.links?.live || "",
          github: project.links?.github || "",
        },
      },
    });
  } catch (error) {
    console.error("Public project detail error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: list projects (paginated + filter)
 */
export const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await getProjectsCollection();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "ALL").trim().toUpperCase();

    const query = {};
    if (status !== "ALL") {
      query.status = status;
    }
    if (q) {
      query.title = { $regex: q, $options: "i" };
    }

    const total = await projects.countDocuments(query);

    const rawProjects = await projects
      .find(query)
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
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      data: rawProjects.map(mapProjectSummary),
    });
  } catch (error) {
    console.error("Admin pagination error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDraftProjectsAdmin = async (req, res) => {
  try {
    const projects = await getProjectsCollection();
    const rawDrafts = await projects
      .find({ status: PROJECT_STATUS.DRAFT })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: rawDrafts.map(mapProjectSummary),
    });
  } catch (error) {
    console.error("Admin get draft projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
