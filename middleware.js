import { NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/jwt";

// Routes that never require auth
const PUBLIC_PAGES = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/request-account",
  "/login",
];

// App routes and the roles allowed to see them
const SUPERADMIN_ONLY = ["/admin"];
const ADMIN_ONLY = ["/stores", "/team", "/plan"];
const OPERATIONAL = ["/dashboard", "/pos", "/register", "/products", "/low-stock", "/categories", "/customers", "/sales", "/reports", "/projections"];

function startsWithAny(path, list) {
  return list.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Static/asset & most API traffic bypass (APIs guard themselves)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  const isPublic = PUBLIC_PAGES.includes(pathname);

  // Signed-in users hitting /login → send to their home
  if (payload && pathname === "/login") {
    return NextResponse.redirect(new URL(homeFor(payload.role), request.url));
  }

  if (isPublic) return NextResponse.next();

  // Beyond here, route is protected
  if (!payload) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const role = payload.role;

  if (startsWithAny(pathname, SUPERADMIN_ONLY) && role !== "superadmin") {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }
  if (startsWithAny(pathname, ADMIN_ONLY) && role !== "admin") {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }
  if (startsWithAny(pathname, OPERATIONAL) && role === "superadmin") {
    return NextResponse.redirect(new URL("/admin/businesses", request.url));
  }

  return NextResponse.next();
}

function homeFor(role) {
  if (role === "superadmin") return "/admin/businesses";
  return "/dashboard";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
