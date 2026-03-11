import { Router } from "express";
import {
  endSession,
  recognizeAttendance,
  startSession,
  studentAttendance,
  teacherOverview,
} from "../controllers/attendanceController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recognizeSchema, startSessionSchema } from "../utils/schemas.js";

const router = Router();

router.use(authenticate);
router.get("/teacher/overview", authorize("teacher"), teacherOverview);
router.get("/student/history", authorize("student"), studentAttendance);
router.post("/sessions/start", authorize("teacher"), validate(startSessionSchema), startSession);
router.post("/sessions/:id/end", authorize("teacher"), endSession);
router.post("/recognize", authorize("teacher"), validate(recognizeSchema), recognizeAttendance);

export default router;
