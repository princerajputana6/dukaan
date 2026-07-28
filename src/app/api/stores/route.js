import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Business from "@/models/Business";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const stores = await Store.find({ business: me.business._id })
      .sort({ createdAt: 1 })
      .lean();
    const business = await Business.findById(me.business._id).lean();
    return NextResponse.json({
      data: stores,
      meta: { storeLimit: business.storeLimit, used: stores.length, plan: business.plan },
    });
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

    const business = await Business.findById(me.business._id);
    const count = await Store.countDocuments({ business: business._id });
    if (count >= business.storeLimit) {
      return NextResponse.json(
        {
          error: `Store limit reached (${business.storeLimit}). Request a plan upgrade to add more stores.`,
          code: "LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name)
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });

    const store = await Store.create({
      business: business._id,
      name: body.name,
      code: body.code || "",
      location: body.location || "",
      phone: body.phone || "",
    });
    return NextResponse.json({ data: store }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
