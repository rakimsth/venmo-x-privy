import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get("userEmail");

  if (!userEmail) {
    return NextResponse.json({ success: false, error: "User email is required" }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const transactions = await Transaction.find({
      $or: [{ userId: user._id }, { to: user.privyWalletAddress }],
    }).sort({ timestamp: -1 });

    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const fromUser = await User.findOne({ privyWalletAddress: transaction.from });
        const toUser = await User.findOne({ privyWalletAddress: transaction.to });

        return {
          ...transaction.toObject(),
          fromName: fromUser ? fromUser.fullName : "Unknown User",
          fromEmail: fromUser ? fromUser.email : "Unknown",
          toName: toUser ? toUser.fullName : "Unknown User",
          toEmail: toUser ? toUser.email : "Unknown",
        };
      })
    );

    return NextResponse.json({ success: true, transactions: transactionsWithDetails });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();

  const { from, to, amount, token, hash } = await req.json();

  if (!from || !to || !amount || !token || !hash) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const fromUser = await User.findOne({ privyWalletAddress: from });
    const toUser = await User.findOne({ privyWalletAddress: to });

    if (!fromUser) {
      return NextResponse.json({ success: false, error: "Sender not found" }, { status: 404 });
    }

    const transaction = new Transaction({
      from,
      to,
      amount,
      token,
      hash: hash?.hash,
      userId: fromUser._id,
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      transaction: {
        ...transaction.toObject(),
        fromName: fromUser.fullName,
        fromEmail: fromUser.email,
        toName: toUser ? toUser.fullName : "Unknown User",
        toEmail: toUser ? toUser.email : "Unknown",
      },
    });
  } catch (error) {
    console.error("Error storing transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store transaction" },
      { status: 500 }
    );
  }
}
