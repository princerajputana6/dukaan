import { NextResponse } from "next/server";
import { getCurrentUser, setActiveStore } from "@/lib/auth";
import Store from "@/models/Store";
import dbConnect from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { storeId } = await request.json();
    await dbConnect();

    // Validate the store belongs to the user's business / assignment
    let allowed = false;
    if (user.role === "admin") {
      const store = await Store.findOne({
        _id: storeId,
        business: user.business._id,
      });
      allowed = !!store;
    } else if (user.role === "manager") {
      allowed = (user.stores || []).some((s) => String(s._id || s) === storeId);
    }
    if (!allowed)
      return NextResponse.json({ error: "Store not allowed" }, { status: 403 });

    await setActiveStore(storeId);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
