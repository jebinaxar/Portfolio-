import { getAnalyticsEventsCollection } from "../collections/analyticsEvents.collection.js";

export const trackAnalyticsEvent = async (req, res) => {
  try {
    const { name, path, meta } = req.body || {};

    if (!name || !path) {
      return res.status(400).json({ message: "Missing analytics fields" });
    }

    const analytics = await getAnalyticsEventsCollection();
    await analytics.insertOne({
      name,
      path,
      meta: typeof meta === "object" && meta ? meta : {},
      userAgent: req.headers["user-agent"] || "unknown",
      ip: req.ip,
      createdAt: new Date(),
    });

    return res.status(202).json({ message: "Tracked" });
  } catch (error) {
    console.error("Track analytics error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
