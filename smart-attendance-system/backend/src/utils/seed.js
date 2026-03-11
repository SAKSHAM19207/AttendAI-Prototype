import bcrypt from "bcryptjs";
import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { ClassModel } from "../models/Class.js";
import { User } from "../models/User.js";

const users = [
  {
    name: "System Admin",
    email: "admin@school.edu",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "Prof. James Wright",
    email: "teacher@school.edu",
    password: "Teacher@123",
    role: "teacher",
  },
  {
    name: "Alex Johnson",
    email: "student@school.edu",
    password: "Student@123",
    role: "student",
    registrationNumber: "STU-001",
    className: "CS301",
  },
  {
    name: "Maria Garcia",
    email: "maria@school.edu",
    password: "Student@123",
    role: "student",
    registrationNumber: "STU-002",
    className: "CS301",
  },
];

export const seedData = async () => {
  const existingAdmin = await User.findOne({ email: "admin@school.edu" });
  if (existingAdmin) return;

  const createdUsers = [];
  for (const item of users) {
    const password = await bcrypt.hash(item.password, 10);
    const user = await User.create({ ...item, password });
    createdUsers.push(user);
  }

  const teacher = createdUsers.find((user) => user.role === "teacher");
  const students = createdUsers.filter((user) => user.role === "student");

  const classDoc = await ClassModel.create({
    name: "Data Structures & Algorithms",
    code: "CS301",
    teacher: teacher._id,
    students: students.map((student) => student._id),
  });

  teacher.assignedClasses = [classDoc._id];
  await teacher.save();

  const firstSession = await AttendanceSession.create({
    classId: classDoc._id,
    teacherId: teacher._id,
    status: "closed",
    startedAt: new Date(Date.now() - 86_400_000),
    endedAt: new Date(Date.now() - 86_040_000),
    recognizedStudentIds: [students[0]._id],
  });

  const secondSession = await AttendanceSession.create({
    classId: classDoc._id,
    teacherId: teacher._id,
    status: "closed",
    startedAt: new Date(Date.now() - 172_800_000),
    endedAt: new Date(Date.now() - 172_440_000),
    recognizedStudentIds: [students[0]._id],
  });

  await AttendanceRecord.insertMany([
    {
      studentId: students[0]._id,
      classId: classDoc._id,
      teacherId: teacher._id,
      sessionId: firstSession._id,
      status: "present",
      confidence: 0.96,
      scanTimestamp: new Date(Date.now() - 86_400_000),
    },
    {
      studentId: students[0]._id,
      classId: classDoc._id,
      teacherId: teacher._id,
      sessionId: secondSession._id,
      status: "present",
      confidence: 0.94,
      scanTimestamp: new Date(Date.now() - 172_800_000),
    },
  ]);
};
