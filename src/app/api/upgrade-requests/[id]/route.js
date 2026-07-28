import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UpgradeRequest from "@/models/UpgradeRequest";
import Business from "@/models/Business";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Superadmin approves/rejects an upgrade request.
export async function PUT(request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const { action, plan } = await request.json(); // action: approve | reject

    const req = await UpgradeRequest.findById(id);
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (req.status !== "pending")
      return NextResponse.json({ error: "Already handled" }, { status: 400 });

    if (action === "approve") {
      const business = await Business.findById(req.business);
      business.storeLimit = req.requestedLimit;
      if (plan) business.plan = plan;
      await business.save();
      req.status = "approved";
    } else if (action === "reject") {
      req.status = "rejected";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    req.handledBy = me._id;
    req.handledAt = new Date();
    await req.save();

    return NextResponse.json({ data: req });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
