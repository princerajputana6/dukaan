import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisterSession from "@/models/RegisterSession";
import Sale from "@/models/Sale";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

// Returns the current open session for the active store (with live totals), or null.
export async function GET() {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();

    const session = await RegisterSession.findOne({ store: scope.storeId, status: "open" }).lean();
    if (!session) return NextResponse.json({ data: null });

    const sales = await Sale.find({ session: session._id }).lean();
    const cashSales = sales.filter((s) => s.paymentMethod === "cash").reduce((a, s) => a + s.total, 0);
    const otherSales = sales.filter((s) => s.paymentMethod !== "cash").reduce((a, s) => a + s.total, 0);

    return NextResponse.json({
      data: {
        ...session,
        cashSales,
        otherSales,
        ordersCount: sales.length,
        expectedCash: (session.openingCash || 0) + cashSales,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
