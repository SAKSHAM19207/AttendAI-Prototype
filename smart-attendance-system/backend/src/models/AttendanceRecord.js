import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    status: { type: String, enum: ["present", "late", "absent"], default: "present" },
    confidence: { type: Number, default: 0 },
    scanTimestamp: { type: Date, default: Date.now },
    faceImage: String,
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);
