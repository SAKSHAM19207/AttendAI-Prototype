import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );
