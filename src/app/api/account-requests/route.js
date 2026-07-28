import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AccountRequest from "@/models/AccountRequest";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Public: prospective owners submit a request from the marketing site.
export async function POST(request) {
  try {
    await dbConnect();
    const { businessName, ownerName, email, phone, storeCount, message } =
      await request.json();
    if (!businessName || !ownerName || !email) {
      return NextResponse.json(
        { error: "Business name, your name and email are required" },
        { status: 400 }
      );
    }
    const req = await AccountRequest.create({
      businessName,
      ownerName,
      email,
      phone: phone || "",
      storeCount: Number(storeCount) || 1,
      message: message || "",
    });
    return NextResponse.json({ data: { id: req._id } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Superadmin: list all account requests.
export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "superadmin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const requests = await AccountRequest.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ data: requests });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
