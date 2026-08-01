import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { resolveScope } from "@/lib/scope";
import { computeInsights, buildHeadline, generativeHeadline } from "@/lib/insights";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [products, sales] = await Promise.all([
      Product.find({ store: scope.storeId }).lean(),
      Sale.find({ store: scope.storeId, createdAt: { $gte: since } }).lean(),
    ]);

    const result = computeInsights(products, sales);
    const facts = {
      reorderCount: result.reorderCount,
      outCount: result.outCount,
      revThisWeek: Math.round(result.revThisWeek),
      revPrevWeek: Math.round(result.revPrevWeek),
      topSeller: result.topName || null,
    };

    let headline = buildHeadline(result);
    let generatedBy = "engine";
    const ai = await generativeHeadline(facts, result.insights);
    if (ai) {
      headline = ai;
      generatedBy = "ai";
    }

    return NextResponse.json({
      data: {
        headline,
        generatedBy,
        insights: result.insights,
        hasData: sales.length > 0 || products.length > 0,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
