import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StockEntry from "@/models/StockEntry";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

// Each view (daily/weekly/monthly) picks a $dateTrunc unit and a look-back range.
const BUCKETS = {
  day: { unit: "day", range: 30 }, // last 30 days
  week: { unit: "week", range: 84 }, // last 12 weeks
  month: { unit: "month", range: 365 }, // last ~12 months
};

const TZ = "Asia/Kolkata";

export async function GET(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bucketKey = searchParams.get("bucket");
    const bucket = BUCKETS[bucketKey] ? bucketKey : "day";
    const { unit, range } = BUCKETS[bucket];

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (range - 1));

    const match = { store: scope.storeObjectId, createdAt: { $gte: since } };

    const [series, totalsAgg, bySource, topProducts, entries] = await Promise.all([
      // Time-bucketed series for the chart.
      StockEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateTrunc: { date: "$createdAt", unit, timezone: TZ } },
            units: { $sum: "$quantity" },
            cost: { $sum: "$totalCost" },
            entries: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Headline totals across the range.
      StockEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            units: { $sum: "$quantity" },
            cost: { $sum: "$totalCost" },
            entries: { $sum: 1 },
            products: { $addToSet: "$product" },
          },
        },
      ]),
      // Breakdown by how the stock was added.
      StockEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$source",
            units: { $sum: "$quantity" },
            cost: { $sum: "$totalCost" },
            entries: { $sum: 1 },
          },
        },
      ]),
      // Most-added products in the range.
      StockEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$productName",
            units: { $sum: "$quantity" },
            cost: { $sum: "$totalCost" },
          },
        },
        { $sort: { units: -1 } },
        { $limit: 8 },
      ]),
      // Individual additions for the table.
      StockEntry.find({ store: scope.storeId, createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(300)
        .lean(),
    ]);

    const t = totalsAgg[0] || {};
    const totals = {
      units: t.units || 0,
      cost: Math.round(t.cost || 0),
      entries: t.entries || 0,
      products: (t.products || []).length,
    };

    return NextResponse.json({
      data: {
        bucket,
        range,
        since,
        totals,
        series: series.map((s) => ({
          date: s._id,
          units: s.units,
          cost: Math.round(s.cost),
          entries: s.entries,
        })),
        bySource: bySource.map((s) => ({
          source: s._id,
          units: s.units,
          cost: Math.round(s.cost),
          entries: s.entries,
        })),
        topProducts: topProducts.map((p) => ({
          name: p._id || "—",
          units: p.units,
          cost: Math.round(p.cost),
        })),
        entries,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
