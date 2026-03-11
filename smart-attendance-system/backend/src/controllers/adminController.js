import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { ClassModel } from "../models/Class.js";
import { User } from "../models/User.js";
import { registerFace } from "../services/aiService.js";
import { saveDataUrlImage } from "../utils/upload.js";

const buildPassword = async (password = "Password@123") => bcrypt.hash(password, 10);

export const createUser = async (req, res) => {
  const payload = req.body;
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    return res.status(409).json({ message: "Email is already in use" });
  }
  const hashedPassword = await buildPassword(payload.password);
  const user = await User.create({ ...payload, password: hashedPassword });
  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    registrationNumber: user.registrationNumber,
    className: user.className,
  });
};

export const listUsers = async (req, res) => {
  const role = req.query.role;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateUser = async (req, res) => {
  const updates = { ...req.body };
  if (updates.email) {
    const existing = await User.findOne({ email: updates.email, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(409).json({ message: "Email is already in use" });
    }
  }
  if (updates.password) {
    updates.password = await buildPassword(updates.password);
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

export const createClass = async (req, res) => {
  const existing = await ClassModel.findOne({ code: req.body.code });
  if (existing) {
    return res.status(409).json({ message: "Class code already exists" });
  }
  const created = await ClassModel.create(req.body);
  res.status(201).json(created);
};

export const listClasses = async (_req, res) => {
  const classes = await ClassModel.find()
    .populate("teacher", "name email")
    .populate("students", "name email registrationNumber");
  res.json(classes);
};

export const assignStudentsToClass = async (req, res) => {
  const updated = await ClassModel.findByIdAndUpdate(
    req.params.id,
    { students: req.body.studentIds },
    { new: true }
  ).populate("students", "name registrationNumber");
  res.json(updated);
};

export const registerStudentFace = async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const faceResult = await registerFace({
    studentId: String(student._id),
    name: student.name,
    image: req.body.image,
  });

  const storedImageUrl = saveDataUrlImage({
    dataUrl: req.body.image,
    folder: `students/${student._id}`,
    prefix: "face",
  });

  student.faceEmbeddings = faceResult.embedding ? [faceResult.embedding] : student.faceEmbeddings;
  student.faceImages = [storedImageUrl, ...(student.faceImages || []).slice(0, 4)];
  await student.save();

  res.json({ message: "Face registered", studentId: student._id });
};

export const getAnalytics = async (_req, res) => {
  const [studentCount, teacherCount, todayCount, totalRecords] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    AttendanceRecord.countDocuments({
      scanTimestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    }),
    AttendanceRecord.countDocuments(),
  ]);

  res.json({
    totalStudents: studentCount,
    totalTeachers: teacherCount,
    dailyAttendance: todayCount,
    attendanceStatistics: totalRecords,
  });
};

export const exportAttendanceReport = async (_req, res) => {
  const records = await AttendanceRecord.find()
    .populate("studentId", "name registrationNumber")
    .populate("classId", "name")
    .sort({ scanTimestamp: -1 });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");
  worksheet.columns = [
    { header: "Student Name", key: "studentName", width: 24 },
    { header: "Registration Number", key: "registrationNumber", width: 20 },
    { header: "Class", key: "className", width: 20 },
    { header: "Date", key: "date", width: 16 },
    { header: "Time", key: "time", width: 16 },
    { header: "Attendance Status", key: "status", width: 18 },
  ];

  records.forEach((record) => {
    const timestamp = new Date(record.scanTimestamp);
    worksheet.addRow({
      studentName: record.studentId?.name || "",
      registrationNumber: record.studentId?.registrationNumber || "",
      className: record.classId?.name || "",
      date: timestamp.toLocaleDateString(),
      time: timestamp.toLocaleTimeString(),
      status: record.status,
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=attendance-report.xlsx");
  await workbook.xlsx.write(res);
  res.end();
};
