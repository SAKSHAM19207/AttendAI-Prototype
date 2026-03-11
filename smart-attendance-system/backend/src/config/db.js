import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

let memoryServer;

export const connectDb = async () => {
  if (env.useMemoryMongo) {
    memoryServer = await MongoMemoryServer.create({
      binary: {
        version: "7.0.14",
      },
    });
    await mongoose.connect(memoryServer.getUri("smart_attendance"));
    return;
  }

  await mongoose.connect(env.mongoUri);
};

export const stopDb = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
