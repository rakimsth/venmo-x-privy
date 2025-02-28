import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  privyWalletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  invite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invite",
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
