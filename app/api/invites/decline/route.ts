import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  const { inviteId, userEmail } = await req.json();

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const invite = user.invites.id(inviteId);
    if (!invite) {
      return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 });
    }

    invite.status = "declined";

    const inviter = await User.findOne({ "invites.email": user.email });
    if (inviter) {
      const inviterInvite = inviter.invites.find((inv) => inv.email === user.email);
      if (inviterInvite) {
        inviterInvite.status = "declined";
      }
      await inviter.save();
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Invite declined" });
  } catch (error) {
    console.error("Failed to decline invite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to decline invite" },
      { status: 500 }
    );
  }
}
