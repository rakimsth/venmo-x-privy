import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: String, required: true },
  token: { type: String, required: true },
  hash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

export default Transaction;
