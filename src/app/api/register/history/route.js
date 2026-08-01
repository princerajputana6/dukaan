import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisterSession from "@/models/RegisterSession";
import { resolveScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scope = await resolveScope();
    if (scope.error)
      return NextResponse.json({ error: scope.error.message }, { status: scope.error.status });
    await dbConnect();
    const sessions = await RegisterSession.find({ store: scope.storeId, status: "closed" })
      .sort({ closedAt: -1 })
      .limit(30)
      .lean();
    return NextResponse.json({ data: sessions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
