import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { seedData } from "./utils/seed.js";

const app = express();
const uploadPath = path.resolve(process.cwd(), env.uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(morgan("dev"));
app.use("/api", apiRateLimit);
app.use(`/${env.uploadDir}`, express.static(uploadPath));

app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    environment: env.nodeEnv,
    useMemoryMongo: env.useMemoryMongo,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier" });
  }
  res.status(error.status || 500).json({ message: error.message || "Server error" });
});

connectDb()
  .then(() => {
    if (env.runSeed) {
      return seedData();
    }
    return null;
  })
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Backend running on ${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
