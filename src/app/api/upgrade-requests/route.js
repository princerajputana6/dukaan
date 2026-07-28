import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UpgradeRequest from "@/models/UpgradeRequest";
import Business from "@/models/Business";
import Store from "@/models/Store";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();

    let filter = {};
    if (me.role === "admin") filter = { business: me.business._id };
    else if (me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await UpgradeRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ data: requests });
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
    const currentStores = await Store.countDocuments({ business: business._id });
    const { requestedLimit, reason } = await request.json();

    if (!requestedLimit || requestedLimit <= business.storeLimit) {
      return NextResponse.json(
        { error: "Requested store count must be greater than your current limit" },
        { status: 400 }
      );
    }

    const pending = await UpgradeRequest.findOne({
      business: business._id,
      status: "pending",
    });
    if (pending) {
      return NextResponse.json(
        { error: "You already have a pending upgrade request" },
        { status: 409 }
      );
    }

    const req = await UpgradeRequest.create({
      business: business._id,
      requestedBy: me._id,
      businessName: business.name,
      currentLimit: business.storeLimit,
      requestedLimit,
      reason: reason || "",
    });
    return NextResponse.json({ data: req }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
