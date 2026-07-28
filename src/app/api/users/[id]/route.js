import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const update = {};
    if (body.name) update.name = body.name;
    if (body.active !== undefined) update.active = body.active;
    if (body.password) update.passwordHash = await hashPassword(body.password);
    if (Array.isArray(body.stores)) {
      const validStores = await Store.find({
        _id: { $in: body.stores },
        business: me.business._id,
      }).select("_id");
      update.stores = validStores.map((s) => s._id);
    }

    const user = await User.findOneAndUpdate(
      { _id: id, business: me.business._id, role: "manager" },
      update,
      { new: true }
    ).populate("stores", "name");
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: user });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const user = await User.findOneAndDelete({
      _id: id,
      business: me.business._id,
      role: "manager",
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
