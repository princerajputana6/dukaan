import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import Store from "@/models/Store";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Sale from "@/models/Sale";
import UpgradeRequest from "@/models/UpgradeRequest";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const allowed = {};
    for (const k of ["name", "ownerName", "email", "phone", "address", "plan", "storeLimit", "status"]) {
      if (body[k] !== undefined) allowed[k] = body[k];
    }
    const business = await Business.findByIdAndUpdate(id, allowed, {
      new: true,
      runValidators: true,
    });
    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: business });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Permanently delete a business and everything scoped to it.
export async function DELETE(_request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;

    const business = await Business.findById(id);
    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Promise.all([
      Product.deleteMany({ business: id }),
      Category.deleteMany({ business: id }),
      Sale.deleteMany({ business: id }),
      Store.deleteMany({ business: id }),
      User.deleteMany({ business: id }),
      UpgradeRequest.deleteMany({ business: id }),
    ]);
    await Business.findByIdAndDelete(id);

    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
