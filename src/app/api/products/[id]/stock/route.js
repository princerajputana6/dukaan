import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";
import { logStockEntry } from "@/lib/stockLog";

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

    // For "set" we need the previous level to record the delta that was added.
    let previousStock = null;
    if (type === "set") {
      const existing = await Product.findOne({ _id: id, store: scope.storeId }).select("stock");
      if (existing) previousStock = existing.stock;
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, store: scope.storeId },
      update,
      { new: true }
    );
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Log stock coming in (adjustments that reduce stock are not logged here).
    if (type === "set") {
      if (previousStock != null) {
        await logStockEntry(scope, product, product.stock - previousStock, "adjustment");
      }
    } else {
      await logStockEntry(scope, product, amt, "restock");
    }

    return NextResponse.json({ data: product });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
