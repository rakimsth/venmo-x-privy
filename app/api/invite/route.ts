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
        await Promise.all([
          User.findByIdAndUpdate(inviter._id, { $set: { friends: inviter.friends } }),
          User.findByIdAndUpdate(invitedUser._id, { $set: { friends: invitedUser.friends } }),
        ]);
      }
      return NextResponse.json({
        success: true,
        message: "User already exists and added as friend",
      });
    }

    // If the user doesn't exist, create an invite
    const invites = inviter.invites || [];

    // Check if an invite for this email already exists
    const existingInvite = invites.find((invite) => invite.email === email);
    if (existingInvite) {
      return NextResponse.json({
        success: true,
        message: "Invitation already sent to this email",
      });
    }

    // Add the new invite
    const newInvite = {
      email,
      fullName,
      status: "pending",
      invitedAt: new Date(),
    };
    invites.push(newInvite);

    // Save the updated inviter data
    const updatedInviter = await User.updateOne({ _id: inviter._id }, { invites });

    if (!updatedInviter) {
      throw new Error("Failed to update inviter");
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("fullName", fullName);
    // Send invitation email
    await sendInvitation(formData);

    return NextResponse.json({ success: true, message: `An invitation has been sent to ${email}` });
  } catch (error) {
    console.error("Failed to process invite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process invite" },
      { status: 500 }
    );
  }
}
