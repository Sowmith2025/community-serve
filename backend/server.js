import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
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
import userRoutes from "./routes/userRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import helpRequestRoutes from "./routes/helpRequestRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/help-requests", helpRequestRoutes);
app.use("/api/contact", contactRoutes);

// --- Serve Angular frontend in production ---
if (process.env.NODE_ENV === "production") {
  const angularDistDir = path.join(__dirname, "../frontend-angular/dist/frontend-angular/browser");

  if (!fs.existsSync(angularDistDir)) {
    console.error("💥 FATAL ERROR: Angular distribution directory not found!");
    process.exit(1);
  }

  app.use(express.static(angularDistDir));

  app.get("*", (req, res) => {
    res.sendFile(path.join(angularDistDir, "index.html"));
  });
}

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
