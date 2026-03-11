import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/smart_attendance",
  useMemoryMongo: process.env.USE_MEMORY_MONGO === "true",
  nodeEnv: process.env.NODE_ENV || "development",
  runSeed: process.env.RUN_SEED === "true",
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://127.0.0.1:5050",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};
