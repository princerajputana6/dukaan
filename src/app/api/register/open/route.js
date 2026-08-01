import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisterSession from "@/models/RegisterSession";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();

    const existing = await RegisterSession.findOne({ store: scope.storeId, status: "open" });
    if (existing)
      return NextResponse.json({ error: "A register is already open for this store" }, { status: 409 });

    const { openingCash = 0 } = await request.json().catch(() => ({}));
    const session = await RegisterSession.create({
      business: scope.businessId,
      store: scope.storeId,
      cashier: scope.user._id,
      cashierName: scope.user.name,
      openingCash: Number(openingCash) || 0,
      openedAt: new Date(),
    });
    return NextResponse.json({ data: session }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
