import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Business, { PLAN_LIMITS } from "@/models/Business";
import Store from "@/models/Store";
import User from "@/models/User";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();

    const businesses = await Business.find().sort({ createdAt: -1 }).lean();
    const storeCounts = await Store.aggregate([
      { $group: { _id: "$business", count: { $sum: 1 } } },
    ]);
    const userCounts = await User.aggregate([
      { $match: { role: { $in: ["admin", "manager"] } } },
      { $group: { _id: "$business", count: { $sum: 1 } } },
    ]);
    const owners = await User.find({ role: "admin" })
      .select("name username business")
      .lean();

    const storeMap = Object.fromEntries(storeCounts.map((s) => [String(s._id), s.count]));
    const userMap = Object.fromEntries(userCounts.map((s) => [String(s._id), s.count]));
    const ownerMap = Object.fromEntries(owners.map((o) => [String(o.business), o]));

    const data = businesses.map((b) => ({
      ...b,
      storeCount: storeMap[String(b._id)] || 0,
      userCount: userMap[String(b._id)] || 0,
      owner: ownerMap[String(b._id)] || null,
    }));
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();

    const body = await request.json();
    const {
      name,
      ownerName,
      email,
      phone,
      address,
      plan = "starter",
      storeLimit,
      username,
      password,
    } = body;

    if (!name || !ownerName || !username || !password) {
      return NextResponse.json(
        { error: "Business name, owner name, username and password are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const business = await Business.create({
      name,
      ownerName,
      email,
      phone,
      address,
      plan,
      storeLimit: storeLimit || PLAN_LIMITS[plan] || 1,
      createdBy: me._id,
    });

    const owner = await User.create({
      username: username.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      name: ownerName,
      role: "admin",
      business: business._id,
    });

    return NextResponse.json(
      { data: { business, owner: { id: owner._id, username: owner.username } } },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
