import axios from "axios";
import { env } from "../config/env.js";

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 30000,
});

export const registerFace = async ({ studentId, name, image }) => {
  const { data } = await aiClient.post("/register-face", {
    student_id: studentId,
    name,
    image,
  });
  return data;
};

export const recognizeFace = async ({ image, candidates }) => {
  const { data } = await aiClient.post("/recognize", { image, candidates });
  return data;
};
