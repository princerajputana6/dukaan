import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();

    const storeFilter = { store: scope.storeId };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [products, todaySales, totalStats] = await Promise.all([
      Product.find(storeFilter).lean(),
      Sale.find({ ...storeFilter, createdAt: { $gte: startOfToday } }).lean(),
      Sale.aggregate([
        { $match: { store: scope.storeObjectId } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            profit: { $sum: "$profit" },
            orders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
    const outOfStock = products.filter((p) => p.stock <= 0);

    const inventoryValue = products.reduce(
      (sum, p) => sum + (p.costPrice || 0) * p.stock,
      0
    );
    const retailValue = products.reduce(
      (sum, p) => sum + (p.sellingPrice || 0) * p.stock,
      0
    );

    const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
    const todayProfit = todaySales.reduce((s, x) => s + x.profit, 0);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      days.push({ date: d, next, label: d, revenue: 0 });
    }
    const recentSales = await Sale.find({
      ...storeFilter,
      createdAt: { $gte: days[0].date },
    }).lean();
    for (const s of recentSales) {
      const bucket = days.find((d) => s.createdAt >= d.date && s.createdAt < d.next);
      if (bucket) bucket.revenue += s.total;
    }

    const topProducts = await Sale.aggregate([
      { $match: { store: scope.storeObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      data: {
        totals: {
          products: products.length,
          revenue: totalStats[0]?.revenue || 0,
          profit: totalStats[0]?.profit || 0,
          orders: totalStats[0]?.orders || 0,
          inventoryValue,
          retailValue,
        },
        today: { revenue: todayRevenue, profit: todayProfit, orders: todaySales.length },
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStock: lowStock.slice(0, 8),
        trend: days.map((d) => ({
          label: d.label.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: Math.round(d.revenue),
        })),
        topProducts,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
