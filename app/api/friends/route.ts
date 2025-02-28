import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email }).populate(
      "friends",
      "fullName email privyWalletAddress"
    );

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      friends: user.friends.map((friend: any) => ({
        id: friend._id,
        name: friend.fullName,
        email: friend.email,
        walletAddress: friend.privyWalletAddress,
      })),
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch friends" }, { status: 500 });
  }
}
