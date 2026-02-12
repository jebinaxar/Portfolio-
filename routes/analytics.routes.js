import express from "express";
import { trackAnalyticsEvent } from "../controllers/analytics.controller.js";

const router = express.Router();

router.post("/events", trackAnalyticsEvent);

export default router;
