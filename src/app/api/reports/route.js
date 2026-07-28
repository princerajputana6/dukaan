import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();

    const businessId = new mongoose.Types.ObjectId(String(me.business._id));
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const stores = await Store.find({ business: me.business._id })
      .sort({ createdAt: 1 })
      .lean();

    // Sales grouped by store within the range
    const byStore = await Sale.aggregate([
      { $match: { business: businessId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: "$store",
          revenue: { $sum: "$total" },
          profit: { $sum: "$profit" },
          orders: { $sum: 1 },
          items: { $sum: { $sum: "$items.quantity" } },
        },
      },
    ]);
    const statMap = Object.fromEntries(byStore.map((s) => [String(s._id), s]));

    // Inventory value per store
    const inventory = await Product.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: "$store",
          retailValue: { $sum: { $multiply: ["$sellingPrice", "$stock"] } },
          products: { $sum: 1 },
        },
      },
    ]);
    const invMap = Object.fromEntries(inventory.map((i) => [String(i._id), i]));

    const perStore = stores.map((s) => {
      const st = statMap[String(s._id)] || {};
      const inv = invMap[String(s._id)] || {};
      return {
        storeId: String(s._id),
        name: s.name,
        location: s.location || "",
        revenue: Math.round(st.revenue || 0),
        profit: Math.round(st.profit || 0),
        orders: st.orders || 0,
        items: st.items || 0,
        products: inv.products || 0,
        retailValue: Math.round(inv.retailValue || 0),
      };
    });

    const totals = perStore.reduce(
      (acc, s) => ({
        revenue: acc.revenue + s.revenue,
        profit: acc.profit + s.profit,
        orders: acc.orders + s.orders,
        items: acc.items + s.items,
      }),
      { revenue: 0, profit: 0, orders: 0, items: 0 }
    );

    // Top products across the whole business
    const topProducts = await Sale.aggregate([
      { $match: { business: businessId, createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    return NextResponse.json({
      data: {
        days,
        perStore,
        totals,
        topProducts,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
