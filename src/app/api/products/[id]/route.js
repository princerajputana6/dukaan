import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";
import { logStockEntry } from "@/lib/stockLog";

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

    // Capture the stock level before the edit so we can log any increase.
    const before = await Product.findOne({ _id: id, store: scope.storeId }).select("stock");

    const product = await Product.findOneAndUpdate(
      { _id: id, store: scope.storeId },
      body,
      { new: true, runValidators: true }
    );
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Editing a product's stock upward counts as an inventory addition.
    if (before) {
      const delta = product.stock - before.stock;
      if (delta > 0) await logStockEntry(scope, product, delta, "adjustment");
    }

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
