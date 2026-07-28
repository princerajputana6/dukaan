import mongoose from "mongoose";
import { getCurrentUser, getActiveStoreId } from "@/lib/auth";
import Store from "@/models/Store";

// Resolves the operating context for inventory/sales APIs.
// Throws { status, message } style errors via the returned `error` field.
export async function resolveScope() {
  const user = await getCurrentUser();
  if (!user) return { error: { status: 401, message: "Not authenticated" } };

  if (user.role === "superadmin") {
    // Superadmin does not operate a store directly.
    return { error: { status: 403, message: "Superadmin has no store context" } };
  }

  // Suspended businesses cannot read or write store data.
  if (user.business?.status === "suspended") {
    return { error: { status: 403, message: "This business account is suspended" } };
  }

  let allowed = [];
  if (user.role === "admin") {
    const stores = await Store.find({ business: user.business._id })
      .select("_id")
      .lean();
    allowed = stores.map((s) => String(s._id));
  } else if (user.role === "manager") {
    allowed = (user.stores || []).map((s) => String(s._id || s));
  }

  if (allowed.length === 0) {
    return { error: { status: 400, message: "No store assigned yet" } };
  }

  const storeId = await getActiveStoreId(user, allowed);
  const businessId = String(user.business._id || user.business);
  return {
    user,
    businessId,
    storeId,
    businessObjectId: new mongoose.Types.ObjectId(businessId),
    storeObjectId: storeId ? new mongoose.Types.ObjectId(storeId) : null,
    allowedStores: allowed,
  };
}
