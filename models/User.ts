import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    privyWalletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    invites: [
      {
        email: { type: String, required: true },
        fullName: { type: String, required: true },
        status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
        invitedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ friends: 1 });

// Ensure the model is only compiled once
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
