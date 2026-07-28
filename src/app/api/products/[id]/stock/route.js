import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

// Adjust stock: { type: "add" | "set", amount: number }
export async function POST(request, { params }) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const { id } = await params;
    const { type = "add", amount } = await request.json();
    if (amount == null || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    const amt = Number(amount);
    const update = type === "set" ? { $set: { stock: amt } } : { $inc: { stock: amt } };
    const product = await Product.findOneAndUpdate(
      { _id: id, store: scope.storeId },
      update,
      { new: true }
    );
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
