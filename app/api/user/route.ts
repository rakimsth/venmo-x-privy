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
      // Update user information
      user.fullName = fullName;

      // Only update privyWalletAddress if it's provided and different from the existing one
      if (privyWalletAddress && privyWalletAddress !== user.privyWalletAddress) {
        user.privyWalletAddress = privyWalletAddress;
      }
    }

    // Check for pending received invites and accept them
    for (const invite of user.receivedInvites) {
      if (invite.status === "pending") {
        invite.status = "accepted";
        const inviter = await User.findOne({ email: invite.email });
        if (inviter) {
          if (!inviter.friends.includes(user._id)) {
            inviter.friends.push(user._id);
            user.friends.push(inviter._id);
          }
          // Update the corresponding sent invite
          const sentInvite = inviter.sentInvites.find((sent: any) => sent.email === user.email);
          if (sentInvite) {
            sentInvite.status = "accepted";
          }
          await inviter.save();
        }
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
