import { ObjectId } from "mongodb";
import { getContactRequestsCollection } from "../collections/contactRequests.collection.js";

/**
 * Public: Submit a contact request
 */
export const submitContactRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contacts = await getContactRequestsCollection();

    const newRequest = {
      name,
      email,
      message,
      status: "new", // new | reviewed | archived
      createdAt: new Date()
    };

    await contacts.insertOne(newRequest);

    return res.status(201).json({
      message: "Contact request submitted"
    });
  } catch (error) {
    console.error("Submit contact error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Get all contact requests
 */
export const getAllContactRequests = async (req, res) => {
  try {
    const contacts = await getContactRequestsCollection();

    const requests = await contacts
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get contacts error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Admin: Mark a contact request as reviewed
 */
export const markContactReviewed = async (req, res) => {
  try {
    const { id } = req.params;

    const contacts = await getContactRequestsCollection();

    const result = await contacts.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "reviewed"
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    return res.status(200).json({
      message: "Contact request marked as reviewed"
    });
  } catch (error) {
    console.error("Review contact error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
