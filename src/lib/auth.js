import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
// Ensure referenced models are registered before populate() runs.
import "@/models/Business";
import "@/models/Store";
import { signToken, verifyToken, SESSION_COOKIE, STORE_COOKIE } from "@/lib/jwt";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user) {
  const token = await signToken({
    uid: String(user._id),
    role: user.role,
    business: user.business ? String(user.business) : null,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(STORE_COOKIE);
}

// Returns the full user document (lean) for the current session, or null.
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.uid) return null;
  await dbConnect();
  const user = await User.findById(payload.uid)
    .populate("business")
    .populate("stores")
    .lean();
  if (!user || user.active === false) return null;
  return user;
}

// Resolve the store the current user is operating in.
// Admins pick any of their business's stores (cookie); managers are limited
// to assigned stores. Returns the storeId string or null.
export async function getActiveStoreId(user, allowedStoreIds) {
  const store = await cookies();
  const cookieStore = store.get(STORE_COOKIE)?.value;
  if (cookieStore && allowedStoreIds.includes(cookieStore)) return cookieStore;
  return allowedStoreIds[0] || null;
}

export async function setActiveStore(storeId) {
  const store = await cookies();
  store.set(STORE_COOKIE, storeId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
