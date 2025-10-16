import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors({ credentials: true }));

// --- MongoDB connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- API Routes ---
import usersRoutes from "./routes/users.js";
import organizerRoutes from "./routes/organizer.js";
import eventsRoutes from "./routes/events.js";
import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";

app.use("/api/users", usersRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

// --- Serve Angular frontend if exists ---
const angularDistDir = path.join(__dirname, "../frontend-angular/dist/frontend-angular//browser");

if (fs.existsSync(angularDistDir)) {
  app.use(express.static(angularDistDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(angularDistDir, "index.html"));
  });
} else {
  console.warn("⚠️ Angular build not found. Frontend will not be served.");
}

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
