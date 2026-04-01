import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGO_URI:
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/music_school",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-dev-key-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  ADMIN_NAME: process.env.ADMIN_NAME || "Super Admin",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@musicschool.com",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@12345",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  CORS_ORIGINS:
    process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || ""
};


