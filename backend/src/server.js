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
import chatbotRoutes from "./routes/chatbotRoutes.js";
import { User } from "./models/User.js";
import { ROLES } from "./utils/roles.js";

const app = express();

const allowedOrigins = ENV.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header), such as Postman or server-to-server calls.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Middleware
app.use(cors(corsOptions));
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
app.use("/api/chatbot", chatbotRoutes);

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