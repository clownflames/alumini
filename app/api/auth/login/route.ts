import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Role -> dashboard route map
const ROLE_DASHBOARD: Record<string, string> = {
  alumni: "/dashboard",
  student: "/student",
  admin: "/faculty",
  super_admin: "/admin",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // ---------- Validation ----------
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    // ---------- Sign in via better-auth ----------
    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });

    // better-auth returns non-2xx on failure
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errBody?.message || "Invalid email or password",
        },
        { status: response.status }
      );
    }

    // ---------- Fetch user role for redirect ----------
    const dbUser = await db.query.user.findFirst({
      where: eq(userTable.email, email),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found after login" },
        { status: 404 }
      );
    }

    // ---------- Block suspended users ----------
    if (dbUser.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          error: "Your account has been suspended. Contact support.",
        },
        { status: 403 }
      );
    }

    const redirectTo = ROLE_DASHBOARD[dbUser.role] ?? "/dashboard";

    // ---------- Forward Set-Cookie headers from better-auth ----------
    const res = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          image: dbUser.image,
        },
        redirectTo,
      },
      { status: 200 }
    );

    // Copy cookies set by better-auth
    response.headers.getSetCookie?.().forEach((cookie) => {
      res.headers.append("Set-Cookie", cookie);
    });

    return res;
  } catch (error: any) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Login failed" },
      { status: 500 }
    );
  }
}