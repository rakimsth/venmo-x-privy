import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const currentUserEmail = searchParams.get("currentUserEmail");

  if (!query || !currentUserEmail) {
    return NextResponse.json(
      { success: false, error: "Query and current user email are required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const currentUser = await User.findOne({ email: currentUserEmail });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: currentUser._id },
    }).select("fullName email privyWalletAddress");

    const results = users.map((user) => ({
      id: user._id,
      name: user.fullName,
      email: user.email,
      walletAddress: user.privyWalletAddress,
      isFriend: currentUser.friends.includes(user._id),
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ success: false, error: "Failed to search users" }, { status: 500 });
  }
}
