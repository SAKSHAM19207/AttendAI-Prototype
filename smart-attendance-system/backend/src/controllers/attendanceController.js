import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { ClassModel } from "../models/Class.js";
import { User } from "../models/User.js";
import { recognizeFace } from "../services/aiService.js";
import { saveDataUrlImage } from "../utils/upload.js";

export const startSession = async (req, res) => {
  const session = await AttendanceSession.create({
    classId: req.body.classId,
    teacherId: req.user._id,
  });
  res.status(201).json(session);
};

export const endSession = async (req, res) => {
  const session = await AttendanceSession.findByIdAndUpdate(
    req.params.id,
    { status: "closed", endedAt: new Date() },
    { new: true }
  );
  res.json(session);
};

export const recognizeAttendance = async (req, res) => {
  const { sessionId, image } = req.body;
  const session = await AttendanceSession.findById(sessionId);
  if (!session || session.status !== "active") {
    return res.status(404).json({ message: "Active session not found" });
  }

  const classDoc = await ClassModel.findById(session.classId);
  const students = await User.find({
    _id: { $in: classDoc.students },
    role: "student",
    faceEmbeddings: { $exists: true, $ne: [] },
  }).select("name registrationNumber className faceEmbeddings");

  const candidates = students.map((student) => ({
    studentId: String(student._id),
    name: student.name,
    embeddings: student.faceEmbeddings,
  }));

  const result = await recognizeFace({ image, candidates });
  if (!result.match) {
    return res.json({ recognized: null, message: result.message || "No face matched" });
  }

  const matchedStudent = await User.findById(result.match.studentId).select("name registrationNumber faceImages className");
  if (!matchedStudent) {
    return res.json({ recognized: null, message: "Matched student not found" });
  }

  const alreadyMarked = session.recognizedStudentIds.some((id) => String(id) === String(matchedStudent._id));
  if (alreadyMarked) {
    return res.json({
      recognized: {
        studentId: matchedStudent._id,
        name: matchedStudent.name,
        registrationNumber: matchedStudent.registrationNumber,
        confidence: result.match.confidence,
        duplicate: true,
      },
    });
  }

  const storedScanUrl = saveDataUrlImage({
    dataUrl: image,
    folder: `attendance/${session._id}`,
    prefix: "scan",
  });

  await AttendanceRecord.create({
    studentId: matchedStudent._id,
    classId: session.classId,
    teacherId: session.teacherId,
    sessionId: session._id,
    status: "present",
    confidence: result.match.confidence,
    scanTimestamp: new Date(),
    faceImage: storedScanUrl,
  });

  session.recognizedStudentIds.push(matchedStudent._id);
  await session.save();

  res.json({
    recognized: {
      studentId: matchedStudent._id,
      name: matchedStudent.name,
      registrationNumber: matchedStudent.registrationNumber,
      confidence: result.match.confidence,
      duplicate: false,
      faceImage: storedScanUrl,
    },
  });
};

export const teacherOverview = async (req, res) => {
  const classes = await ClassModel.find({ teacher: req.user._id });
  const history = await AttendanceRecord.find({ teacherId: req.user._id })
    .populate("studentId", "name registrationNumber")
    .populate("classId", "name code")
    .sort({ scanTimestamp: -1 })
    .limit(50);
  res.json({ classes, history });
};

export const studentAttendance = async (req, res) => {
  const records = await AttendanceRecord.find({ studentId: req.user._id })
    .populate("classId", "name code")
    .sort({ scanTimestamp: -1 });
  const total = records.length;
  const present = records.filter((record) => record.status === "present").length;
  res.json({
    profile: req.user,
    attendancePercentage: total ? Math.round((present / total) * 100) : 0,
    records,
  });
};
