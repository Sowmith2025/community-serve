// server.js
import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

// --- Setup Express app ---
const app = express();

// --- Resolve __dirname in ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json());
app.use(cors({ credentials: true }));

// --- MongoDB connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- API routes ---
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import userRoutes from "./routes/users.js";
import attendanceRoutes from "./routes/attendance.js";
import organizerRoutes from "./routes/organizer.js";

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/organizer", organizerRoutes);

// --- Health check route ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Community Service API is running!",
    timestamp: new Date().toISOString(),
  });
});

// --- Serve Angular frontend (for Render production) ---
const angularDistPath = path.join(__dirname, "../frontend-angular/dist/frontend-angular/browser");

//const angularDistPath = path.join(__dirname, "public", "browser");

if (fs.existsSync(angularDistPath)) {
  app.use(express.static(angularDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(angularDistPath, "index.html"));
  });
} else {
  console.error("❌ Angular build not found:", angularDistPath);
}

// --- Start server ---
const PORT = process.env.PORT || 5000;

// Bind to all interfaces for Render compatibility
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
