import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  const { inviteId, userEmail } = await req.json();

  if (!inviteId || !userEmail) {
    return NextResponse.json(
      { success: false, error: "Invite ID and user email are required" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const invite = user.receivedInvites.id(inviteId);
    if (!invite) {
      return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ success: false, error: "Invite is not pending" }, { status: 400 });
    }

    invite.status = "accepted";

    const inviter = await User.findOne({ email: invite.email });
    if (inviter) {
      const inviterInvite = inviter.sentInvites.find((inv: any) => inv.email === user.email);
      if (inviterInvite) {
        inviterInvite.status = "accepted";
      }
      inviter.friends.push(user._id);
      user.friends.push(inviter._id);
      await inviter.save();
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Invite accepted" });
  } catch (error) {
    console.error("Failed to accept invite:", error);
    return NextResponse.json({ success: false, error: "Failed to accept invite" }, { status: 500 });
  }
}
