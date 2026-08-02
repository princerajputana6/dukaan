import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { resolveScope } from "@/lib/scope";
import { computeProjections, generativeProjection } from "@/lib/projections";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    const result = computeProjections(products, sales);

    let narrative = null;
    let generatedBy = "engine";
    if (result.hasData) {
      const facts = {
        avgDailyRevenue: result.avgDailyRevenue,
        salesNext7: result.salesNext7,
        salesNext30: result.salesNext30,
        profitNext30: result.profitNext30,
        trendPct: result.trendPct,
        soonestStockout: result.stockouts[0]
          ? { name: result.stockouts[0].name, daysLeft: result.stockouts[0].daysLeft }
          : null,
      };
      const ai = await generativeProjection(facts);
      if (ai) {
        narrative = ai;
        generatedBy = "ai";
      }
    }

    return NextResponse.json({ data: { ...result, narrative, generatedBy } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
