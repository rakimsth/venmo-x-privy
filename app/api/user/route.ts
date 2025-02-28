import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Invite from "@/models/Invite";

export async function POST(req: Request) {
  await dbConnect();

  const { email, fullName, privyWalletAddress } = await req.json();

  try {
    // Check if there's a pending invite for this email
    const invite = await Invite.findOne({ email, status: "pending" });

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        fullName,
        privyWalletAddress,
      });
    } else {
      // Update existing user
      user.fullName = fullName;
      user.privyWalletAddress = privyWalletAddress;
    }

    if (invite) {
      // Update invite status
      invite.status = "accepted";
      invite.user = user._id;
      await invite.save();

      // Link invite to user
      user.invite = invite._id;
    }

    await user.save();

    console.log("User saved/updated:", user);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in user API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
