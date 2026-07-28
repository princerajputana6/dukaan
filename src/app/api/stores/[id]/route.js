import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const allowed = {};
    for (const k of ["name", "code", "location", "phone", "active"]) {
      if (body[k] !== undefined) allowed[k] = body[k];
    }
    const store = await Store.findOneAndUpdate(
      { _id: id, business: me.business._id },
      allowed,
      { new: true }
    );
    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: store });
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
    const productCount = await Product.countDocuments({ store: id });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `This store has ${productCount} products. Remove them before deleting.` },
        { status: 400 }
      );
    }
    const store = await Store.findOneAndDelete({ _id: id, business: me.business._id });
    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
