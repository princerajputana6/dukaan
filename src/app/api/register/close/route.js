import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisterSession from "@/models/RegisterSession";
import Sale from "@/models/Sale";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

// Close the open register, reconcile counted vs expected cash, save the day-end record.
export async function POST(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();

    const session = await RegisterSession.findOne({ store: scope.storeId, status: "open" });
    if (!session)
      return NextResponse.json({ error: "No open register to close" }, { status: 400 });

    const { closingCash = 0, note = "" } = await request.json().catch(() => ({}));

    const sales = await Sale.find({ session: session._id }).lean();
    const cashSales = sales.filter((s) => s.paymentMethod === "cash").reduce((a, s) => a + s.total, 0);
    const otherSales = sales.filter((s) => s.paymentMethod !== "cash").reduce((a, s) => a + s.total, 0);
    const expectedCash = (session.openingCash || 0) + cashSales;
    const counted = Number(closingCash) || 0;

    session.closingCash = counted;
    session.closedAt = new Date();
    session.cashSales = cashSales;
    session.otherSales = otherSales;
    session.ordersCount = sales.length;
    session.expectedCash = expectedCash;
    session.difference = counted - expectedCash;
    session.note = note;
    session.status = "closed";
    await session.save();

    return NextResponse.json({ data: session });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
