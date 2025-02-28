import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendInvitation } from "@/app/actions/sendInvitation";

export async function POST(req: Request) {
  await dbConnect();

  const { email, fullName, inviterEmail } = await req.json();

  if (!email || !fullName || !inviterEmail) {
    return NextResponse.json(
      { success: false, error: "Email, full name, and inviter email are required" },
      { status: 400 }
    );
  }

  try {
    // Find the inviter
    const inviter = await User.findOne({ email: inviterEmail });
    if (!inviter) {
      return NextResponse.json({ success: false, error: "Inviter not found" }, { status: 404 });
    }

    // Check if the invited user already exists
    let invitedUser = await User.findOne({ email });

    if (invitedUser) {
      // Check if they are already friends
      if (inviter.friends.includes(invitedUser._id)) {
        return NextResponse.json({
          success: false,
          error: "User is already a friend",
        });
      }

      // Create an invite
      const newInvite = {
        email: invitedUser.email,
        fullName: invitedUser.fullName,
        status: "pending",
        invitedAt: new Date(),
      };

      // Add to inviter's sentInvites
      inviter.sentInvites.push(newInvite);
      await inviter.save();

      // Add to invited user's receivedInvites
      invitedUser.receivedInvites.push({
        email: inviter.email,
        fullName: inviter.fullName,
        status: "pending",
        invitedAt: new Date(),
      });
      await invitedUser.save();
    } else {
      // Create a new user with minimal information
      invitedUser = new User({
        email,
        fullName,
        privyWalletAddress: "", // This will be set when the user actually signs up
      });

      // Create an invite
      const newInvite = {
        email: inviter.email,
        fullName: inviter.fullName,
        status: "pending",
        invitedAt: new Date(),
      };

      // Add to inviter's sentInvites
      inviter.sentInvites.push({
        email,
        fullName,
        status: "pending",
        invitedAt: new Date(),
      });
      await inviter.save();

      // Add to new user's receivedInvites
      invitedUser.receivedInvites.push(newInvite);
      await invitedUser.save();
    }

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
