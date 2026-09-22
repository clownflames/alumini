import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "super_admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const signupResponse = await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "student",
      },
    });

    if (!signupResponse?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Failed to create student account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student account created",
        data: {
          userId: signupResponse.user.id,
          email: signupResponse.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[STUDENT_CREATE]", error);

    let current = error;
    while (current) {
      if (current.code === "23505" || current.message?.includes("unique")) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email already exists",
          },
          { status: 409 }
        );
      }
      current = current.cause;
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create student account",
      },
      { status: 500 }
    );
  }
}