import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    recognizedStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { timestamps: true }
);

export const AttendanceSession = mongoose.model("AttendanceSession", attendanceSessionSchema);
