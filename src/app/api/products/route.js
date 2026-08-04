import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { resolveScope } from "@/lib/scope";
import { logStockEntry } from "@/lib/stockLog";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const lowStock = searchParams.get("lowStock");

    const filter = { store: scope.storeId };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
        { barcode: { $regex: q, $options: "i" } },
      ];
    }
    if (category && category !== "all") filter.category = category;

    let products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    if (lowStock === "true") {
      products = products.filter((p) => p.stock <= p.lowStockThreshold);
    }
    return NextResponse.json({ data: products });
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
    if (!body.name || body.sellingPrice == null) {
      return NextResponse.json(
        { error: "Name and selling price are required" },
        { status: 400 }
      );
    }
    const product = await Product.create({
      ...body,
      business: scope.businessId,
      store: scope.storeId,
    });
    // Log the opening stock as an inventory addition.
    await logStockEntry(scope, product, product.stock, "new");
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
