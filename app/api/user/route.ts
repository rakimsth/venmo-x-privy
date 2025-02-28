import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  const { email, fullName, privyWalletAddress } = await req.json();

  try {
    // Find or create the user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, fullName, privyWalletAddress });
    } else {
      user.fullName = fullName;
      user.privyWalletAddress = privyWalletAddress;
    }

    // Check for pending invites and accept them
    const inviters = await User.find({ "invites.email": email, "invites.status": "pending" });
    for (const inviter of inviters) {
      const invite = inviter.invites.find((inv) => inv.email === email && inv.status === "pending");
      if (invite) {
        invite.status = "accepted";
        inviter.friends.push(user._id);
        user.friends.push(inviter._id);
        await inviter.save();
      }
    }

    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Failed to create/update user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
