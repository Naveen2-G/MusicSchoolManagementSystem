import mongoose from "mongoose";

const enrollmentRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    instrument: { type: String },
    preferredTime: { type: String, required: true },
    message: { type: String },
    source: { type: String, default: "Landing Page" },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending"
    },
    adminNotes: { type: String }
  },
  { timestamps: true }
);

export const EnrollmentRequest = mongoose.model(
  "EnrollmentRequest",
  enrollmentRequestSchema
);
