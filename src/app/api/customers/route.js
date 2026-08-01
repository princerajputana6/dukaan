import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const filter = { store: scope.storeId };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }
    const customers = await Customer.find(filter).sort({ lastVisit: -1, createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ data: customers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const body = await request.json();
    if (!body.name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const customer = await Customer.create({
      business: scope.businessId,
      store: scope.storeId,
      name: body.name,
      phone: body.phone || "",
      email: body.email || "",
      note: body.note || "",
    });
    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ error: "A customer with this phone already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
