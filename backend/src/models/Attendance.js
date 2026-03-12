import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      default: "Present"
    },
    notes: { type: String, default: "" },
    markedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

attendanceSchema.index({ teacher: 1, student: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
