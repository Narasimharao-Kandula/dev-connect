import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import projectsRoutes from "./modules/projects/projects.routes";
import requestsRoutes from "./modules/requests/requests.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import chatRoutes from "./modules/chat/chat.routes";
import teamsRoutes from "./modules/teams/teams.routes";
import statsRoutes from "./modules/stats/stats.routes";
import contactRoutes from "./modules/contact/contact.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";
import bookmarksRoutes from "./modules/bookmarks/bookmarks.routes";
import searchRoutes from "./modules/search/search.routes";
import feedRoutes from "./modules/feed/feed.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import tasksRoutes from "./modules/tasks/tasks.routes";
import followRoutes from "./modules/follow/follow.routes";
import adminRoutes from "./modules/admin/admin.routes";
import matchRoutes from "./modules/match/match.routes";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api", chatRoutes);
app.use("/api", teamsRoutes);
app.use("/api", statsRoutes);
app.use("/api", contactRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/match", matchRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
