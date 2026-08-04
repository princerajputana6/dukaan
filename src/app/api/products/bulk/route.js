import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";
import { logStockEntry } from "@/lib/stockLog";

export const dynamic = "force-dynamic";

// Bulk-create products (used by the receipt-import flow).
export async function POST(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();

    const { items = [] } = await request.json();
    const valid = items.filter((i) => i.name && String(i.name).trim());
    if (valid.length === 0) {
      return NextResponse.json({ error: "No valid items to import" }, { status: 400 });
    }

    const docs = valid.map((i) => ({
      business: scope.businessId,
      store: scope.storeId,
      name: String(i.name).trim(),
      category: i.category || "Uncategorized",
      unit: i.unit || "pcs",
      costPrice: Number(i.costPrice) || 0,
      sellingPrice: Number(i.sellingPrice) || Number(i.costPrice) || 0,
      stock: Number(i.stock) || 0,
      lowStockThreshold: Number(i.lowStockThreshold) || 10,
      active: true,
    }));

    const created = await Product.insertMany(docs);
    // Record each imported item's opening stock as an inventory addition.
    await Promise.all(
      created.map((p) => logStockEntry(scope, p, p.stock, "receipt"))
    );
    return NextResponse.json({ data: { count: created.length } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
