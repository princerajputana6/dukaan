import { redirect } from "next/navigation";
import { getCurrentUser, getActiveStoreId } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import NoStoreState from "@/components/NoStoreState";

// Pages in this group require an active store. New owners (no store yet) and
// unassigned managers see a guided empty state instead of a data-load error.
export default async function ShopLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();

  let allowedIds = [];
  if (user.role === "admin") {
    const stores = await Store.find({ business: user.business._id })
      .select("_id")
      .lean();
    allowedIds = stores.map((s) => String(s._id));
  } else if (user.role === "manager") {
    allowedIds = (user.stores || []).map((s) => String(s._id || s));
  }

  const activeStoreId =
    user.role === "superadmin" ? null : await getActiveStoreId(user, allowedIds);

  if (!activeStoreId) {
    return <NoStoreState role={user.role} ownerName={user.name} />;
  }

  return children;
}
