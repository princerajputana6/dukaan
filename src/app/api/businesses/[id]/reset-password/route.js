import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

function genPassword() {
  return "dk" + Math.floor(100000 + Math.random() * 900000);
}

// Super Admin resets a business owner's login password.
export async function POST(request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const owner = await User.findOne({ business: id, role: "admin" });
    if (!owner)
      return NextResponse.json({ error: "Owner not found for this business" }, { status: 404 });

    const password = (body.password && String(body.password).trim()) || genPassword();
    owner.passwordHash = await hashPassword(password);
    await owner.save();

    return NextResponse.json({ data: { username: owner.username, password } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
