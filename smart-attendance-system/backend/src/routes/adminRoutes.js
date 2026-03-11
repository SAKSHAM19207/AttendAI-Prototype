import { Router } from "express";
import {
  assignStudentsToClass,
  createClass,
  createUser,
  deleteUser,
  exportAttendanceReport,
  getAnalytics,
  listClasses,
  listUsers,
  registerStudentFace,
  updateUser,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  assignStudentsSchema,
  createClassSchema,
  createUserSchema,
  faceRegistrationSchema,
  updateUserSchema,
} from "../utils/schemas.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/analytics", getAnalytics);
router.get("/users", listUsers);
router.post("/users", validate(createUserSchema), createUser);
router.put("/users/:id", validate(updateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);
router.post("/classes", validate(createClassSchema), createClass);
router.get("/classes", listClasses);
router.put("/classes/:id/students", validate(assignStudentsSchema), assignStudentsToClass);
router.post("/students/:id/register-face", validate(faceRegistrationSchema), registerStudentFace);
router.get("/reports/attendance.xlsx", exportAttendanceReport);

export default router;
