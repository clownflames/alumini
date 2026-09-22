import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/login", "/register", "/"];

// Map role -> allowed dashboard prefix
const roleDashboard: Record<string, string> = {
  alumni: "/dashboard",
  student: "/student",
  admin: "/faculty",
  super_admin: "/admin",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isPublic = publicRoutes.some((r) => pathname === r);

  // ---------- Not logged in ----------
  if (!sessionCookie) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ---------- Logged in: fetch session ----------
  try {
    const res = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await res.json();
    const role = session?.user?.role as string | undefined;
    const dashboard = roleDashboard[role ?? "alumni"] ?? "/dashboard";

    // Logged-in user visiting /login or /register -> go to their dashboard
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Protect dashboards
    const protectedPrefixes = ["/dashboard", "/student", "/faculty", "/admin"];
    const matched = protectedPrefixes.find((p) => pathname.startsWith(p));

    if (matched && matched !== dashboard) {
      // user trying to access a dashboard that's not theirs
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};