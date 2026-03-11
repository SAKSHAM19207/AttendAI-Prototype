import { Router } from "express";
import { login, logout, me, refresh } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, refreshSchema } from "../utils/schemas.js";

const router = Router();

router.post("/login", authRateLimit, validate(loginSchema), login);
router.post("/refresh", authRateLimit, validate(refreshSchema), refresh);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
