import { ObjectId } from "mongodb";
import { getProjectsCollection } from "../collections/projects.collection.js";

/**
 * Admin: Create a new project (always draft)
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, techStack } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const projects = await getProjectsCollection();

    const newProject = {
      title,
      description,
      techStack: techStack || [],
      status: "draft",
      clientApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await projects.insertOne(newProject);

    return res.status(201).json({
      message: "Project created as draft",
      project: newProject
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Update a project (draft or published)
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project updated" });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Publish a project (explicit action)
 */
export const publishProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      { _id: new ObjectId(id), clientApproved: true },
      {
        $set: {
          status: "published",
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "Project not approved by client or not found"
      });
    }

    return res.status(200).json({ message: "Project published" });
  } catch (error) {
    console.error("Publish project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Public: Get all published projects
 */
export const getPublishedProjects = async (req, res) => {
  try {
    const projects = await getProjectsCollection();

    const publishedProjects = await projects
      .find({ status: "published" })
      .toArray();

    return res.status(200).json(publishedProjects);
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Mark project as client approved
 */
export const approveProjectByClient = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          clientApproved: true,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({
      message: "Project approved by client"
    });
  } catch (error) {
    console.error("Approve project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

