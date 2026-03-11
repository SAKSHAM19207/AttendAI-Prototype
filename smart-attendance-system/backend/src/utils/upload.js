import crypto from "crypto";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const ensureDir = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const extensionFromMime = (mimeType) => {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
};

export const saveDataUrlImage = ({ dataUrl, folder = "general", prefix = "image" }) => {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL");
  }

  const [, mimeType, encoded] = match;
  const ext = extensionFromMime(mimeType);
  const fileName = `${prefix}-${crypto.randomUUID()}.${ext}`;
  const relativeDir = path.join(env.uploadDir, folder);
  const absoluteDir = path.resolve(process.cwd(), relativeDir);
  ensureDir(absoluteDir);

  const absolutePath = path.join(absoluteDir, fileName);
  fs.writeFileSync(absolutePath, Buffer.from(encoded, "base64"));

  const relativePath = `/${relativeDir.replaceAll(path.sep, "/")}/${fileName}`;
  return `${env.publicBaseUrl}${relativePath}`;
};
