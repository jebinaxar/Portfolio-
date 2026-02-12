import { ObjectId } from "mongodb";
import { getContactRequestsCollection } from "../collections/contactRequests.collection.js";
import { validateAndNormalizeContactPayload } from "../services/contact.service.js";

/**
 * Public: Submit a contact request
 */
export const submitContactRequest = async (req, res) => {
  try {
    const validation = validateAndNormalizeContactPayload(req.body);
    if (!validation.ok) {
      return res.status(validation.statusCode).json({ message: validation.message });
    }

    const contacts = await getContactRequestsCollection();
    await contacts.insertOne(validation.payload);

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
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid contact request id" });
    }

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
