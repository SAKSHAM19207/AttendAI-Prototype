import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "teacher", "student"]),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(["admin", "teacher", "student"]),
  registrationNumber: z.string().min(2).max(50).optional(),
  className: z.string().min(2).max(100).optional(),
  assignedClasses: z.array(z.string()).optional(),
});

export const updateUserSchema = createUserSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided"
);

export const createClassSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(50),
  teacher: z.string().min(1),
  students: z.array(z.string()).optional(),
});

export const assignStudentsSchema = z.object({
  studentIds: z.array(z.string()).min(1),
});

export const faceRegistrationSchema = z.object({
  image: z.string().startsWith("data:image/", "Image must be a base64 data URL"),
});

export const startSessionSchema = z.object({
  classId: z.string().min(1),
});

export const recognizeSchema = z.object({
  sessionId: z.string().min(1),
  image: z.string().startsWith("data:image/", "Image must be a base64 data URL"),
});
