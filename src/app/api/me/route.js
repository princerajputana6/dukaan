import { NextResponse } from "next/server";
import { getCurrentUser, getActiveStoreId } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";

export const dynamic = "force-dynamic";

// Returns the current user plus their business and active store details.
// Used by the POS to build receipt headers/footers.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await dbConnect();

    let allowed = [];
    if (user.role === "admin") {
      const stores = await Store.find({ business: user.business._id })
        .select("_id")
        .lean();
      allowed = stores.map((s) => String(s._id));
    } else if (user.role === "manager") {
      allowed = (user.stores || []).map((s) => String(s._id || s));
    }
    const activeStoreId =
      user.role === "superadmin" ? null : await getActiveStoreId(user, allowed);

    let store = null;
    if (activeStoreId) {
      store = await Store.findById(activeStoreId).lean();
    }

    const b = user.business;
    return NextResponse.json({
      data: {
        user: { id: String(user._id), name: user.name, role: user.role },
        business: b
          ? {
              id: String(b._id),
              name: b.name,
              type: b.type || "retail",
              gstin: b.gstin || "",
              fssai: b.fssai || "",
              gstRate: b.gstRate || 0,
              pricesIncludeTax: b.pricesIncludeTax !== false,
              receiptFooter: b.receiptFooter || "",
              address: b.address || "",
              phone: b.phone || "",
            }
          : null,
        store: store
          ? {
              id: String(store._id),
              name: store.name,
              location: store.location || "",
              phone: store.phone || "",
            }
          : null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
