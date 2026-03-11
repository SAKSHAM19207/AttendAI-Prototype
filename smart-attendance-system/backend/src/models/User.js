import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    registrationNumber: String,
    className: String,
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    faceEmbeddings: [[Number]],
    faceImages: [String],
    refreshTokenHash: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
