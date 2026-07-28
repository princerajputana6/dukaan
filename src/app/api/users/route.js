import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const users = await User.find({ business: me.business._id, role: "manager" })
      .populate("stores", "name")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ data: users });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();

    const { name, username, password, stores = [] } = await request.json();
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Name, username and password are required" },
        { status: 400 }
      );
    }
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing)
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });

    // Ensure assigned stores belong to this business
    const validStores = await Store.find({
      _id: { $in: stores },
      business: me.business._id,
    }).select("_id");

    const user = await User.create({
      name,
      username: username.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      role: "manager",
      business: me.business._id,
      stores: validStores.map((s) => s._id),
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
