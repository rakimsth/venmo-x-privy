import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Invite from "@/models/Invite";

export async function POST(req: Request) {
  await dbConnect();

  const { email, fullName } = await req.json();

  try {
    const invite = await Invite.create({ email, fullName });
    return NextResponse.json({ success: true, invite });
  } catch (error) {
    console.log({ error });
    return NextResponse.json({ success: false, error: "Failed to create invite" }, { status: 500 });
  }
}
