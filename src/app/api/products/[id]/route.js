import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const product = await Product.findOne({ _id: id, store: scope.storeId }).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: product });
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
    // Never allow tenancy fields to be overwritten by the client
    delete body.business;
    delete body.store;
    const product = await Product.findOneAndUpdate(
      { _id: id, store: scope.storeId },
      body,
      { new: true, runValidators: true }
    );
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (err) {
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
    const product = await Product.findOneAndDelete({ _id: id, store: scope.storeId });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
