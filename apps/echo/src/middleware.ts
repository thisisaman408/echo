import { NextRequest, NextResponse } from "next/server";

const COOKIE = "echo_auth";
const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "echo2026";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/recall") ||
    pathname.startsWith("/api/inngest") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (token === PASSWORD) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
