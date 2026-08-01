import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Sale from "@/models/Sale";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const customer = await Customer.findOne({ _id: id, store: scope.storeId }).lean();
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const sales = await Sale.find({ customer: id }).sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ data: { ...customer, sales } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const update = {};
    for (const k of ["name", "phone", "email", "note"]) if (body[k] !== undefined) update[k] = body[k];
    const customer = await Customer.findOneAndUpdate({ _id: id, store: scope.storeId }, update, { new: true });
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: customer });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ error: "A customer with this phone already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const customer = await Customer.findOneAndDelete({ _id: id, store: scope.storeId });
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
