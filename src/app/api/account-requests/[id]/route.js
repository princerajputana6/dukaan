import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AccountRequest from "@/models/AccountRequest";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const { status } = await request.json();
    const req = await AccountRequest.findByIdAndUpdate(
      id,
      { status, handledBy: me._id },
      { new: true }
    );
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: req });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
