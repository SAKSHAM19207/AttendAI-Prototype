import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email, role });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();
  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      className: user.className,
      registrationNumber: user.registrationNumber,
    },
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, env.refreshTokenSecret);
    const user = await User.findById(decoded.id);
    if (!user?.refreshTokenHash) {
      return res.status(401).json({ message: "Refresh token is invalid" });
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      return res.status(401).json({ message: "Refresh token is invalid" });
    }

    const nextAccessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(nextRefreshToken, 10);
    await user.save();

    res.json({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
        registrationNumber: user.registrationNumber,
      },
    });
  } catch {
    res.status(401).json({ message: "Refresh token is invalid" });
  }
};

export const logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshTokenHash = undefined;
    await user.save();
  }
  res.json({ message: "Logged out" });
};
