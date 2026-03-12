import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { User } from "./models/User.js";
import { ROLES } from "./utils/roles.js";

const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: ENV.NODE_ENV });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();

  // Auto-create admin if not exists
  const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
  if (!existingAdmin) {
    console.log("No admin user found. Creating default admin...");
    await User.create({
      name: ENV.ADMIN_NAME,
      email: ENV.ADMIN_EMAIL,
      username: ENV.ADMIN_USERNAME,
      password: ENV.ADMIN_PASSWORD,
      role: ROLES.ADMIN,
      isActive: true,
      forcePasswordChange: true
    });
    console.log(`Admin created. Username: ${ENV.ADMIN_USERNAME}, Email: ${ENV.ADMIN_EMAIL}`);
  }

  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});