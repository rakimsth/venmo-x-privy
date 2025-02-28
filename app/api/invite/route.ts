import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendInvitation } from "@/app/actions/sendInvitation";

export async function POST(req: Request) {
  await dbConnect();

  const { email, fullName, inviterEmail } = await req.json();

  try {
    // Find the inviter
    const inviter = await User.findOne({ email: inviterEmail });
    if (!inviter) {
      return NextResponse.json({ success: false, error: "Inviter not found" }, { status: 404 });
    }

    // Check if the invited user already exists
    const invitedUser = await User.findOne({ email });

    if (invitedUser) {
      // If the user exists, add them as a friend if not already
      if (!inviter.friends.includes(invitedUser._id)) {
        inviter.friends.push(invitedUser._id);
        invitedUser.friends.push(inviter._id);
        await Promise.all([inviter.save(), invitedUser.save()]);
      }
      return NextResponse.json({
        success: true,
        message: "User already exists and added as friend",
      });
    }

    // If the user doesn't exist, create an invite
    const newInvite = {
      email,
      fullName,
      status: "pending",
      invitedAt: new Date(),
    };

    inviter.invites.push(newInvite);
    await inviter.save();

    // Send invitation email
    const formData = new FormData();
    formData.append("email", email);
    formData.append("fullName", fullName);
    await sendInvitation(formData);

    return NextResponse.json({ success: true, message: "Invitation sent and recorded" });
  } catch (error) {
    console.error("Failed to process invite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process invite" },
      { status: 500 }
    );
  }
}
