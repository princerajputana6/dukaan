import { redirect } from "next/navigation";
import { getCurrentUser, getActiveStoreId } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Store from "@/models/Store";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await dbConnect();

  let stores = [];
  if (user.role === "admin") {
    stores = await Store.find({ business: user.business._id })
      .sort({ createdAt: 1 })
      .lean();
  } else if (user.role === "manager") {
    stores = (user.stores || []).filter(Boolean);
  }

  const allowedIds = stores.map((s) => String(s._id));
  const activeStoreId =
    user.role === "superadmin" ? null : await getActiveStoreId(user, allowedIds);

  const sessionUser = {
    id: String(user._id),
    name: user.name,
    username: user.username,
    role: user.role,
    business: user.business
      ? {
          id: String(user.business._id),
          name: user.business.name,
          plan: user.business.plan,
          storeLimit: user.business.storeLimit,
        }
      : null,
  };

  const storeList = stores.map((s) => ({
    id: String(s._id),
    name: s.name,
    location: s.location || "",
  }));

  return (
    <AppShell user={sessionUser} stores={storeList} activeStoreId={activeStoreId}>
      {children}
    </AppShell>
  );
}
