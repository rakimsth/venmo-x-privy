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

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const receivedInvites = user.receivedInvites.map((invite: any) => ({
      id: invite._id.toString(),
      email: invite.email,
      fullName: invite.fullName,
      status: invite.status,
      invitedAt: invite.invitedAt,
      type: "received",
    }));

    const sentInvites = user.sentInvites.map((invite: any) => ({
      id: invite._id.toString(),
      email: invite.email,
      fullName: invite.fullName,
      status: invite.status,
      invitedAt: invite.invitedAt,
      type: "sent",
    }));

    return NextResponse.json({
      success: true,
      receivedInvites,
      sentInvites,
    });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invites" }, { status: 500 });
  }
}
