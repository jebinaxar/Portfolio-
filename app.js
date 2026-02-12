import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
    })
  );

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  app.use("/auth", authRoutes);
  app.use("/projects", projectRoutes);
  app.use("/contacts", contactRoutes);
  app.use("/analytics", analyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
