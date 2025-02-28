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
    const user = await User.findOne({ email });

    return NextResponse.json({
      success: true,
      user: user
        ? {
            email: user.email,
            fullName: user.fullName,
            privyWalletAddress: user.privyWalletAddress,
            hasFullName: !!user.fullName,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ success: false, error: "Failed to check user" }, { status: 500 });
  }
}
