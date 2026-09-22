import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema";
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
    const {
      name,
      email,
      password,
      // profile fields
      firstName,
      lastName,
      headline,
      bio,
      phone,
      city,
      state,
      country,
      currentJobTitle,
      graduationYear,
      collegeId,
      departmentId,
      batchId,
      isVerified,
      isOpenToWork,
      isMentor,
    } = body;

    /* ---------- Validation ---------- */
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

    /* ---------- Create user via better-auth ---------- */
    // This handles password hashing + account table insert automatically
    const signupResponse = await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "alumni",
      },
    });

    if (!signupResponse?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Failed to create user account" },
        { status: 500 }
      );
    }

    const userId = signupResponse.user.id;

    /* ---------- Create alumni profile ---------- */
    try {
      await db.insert(alumniProfiles).values({
        id: crypto.randomUUID(),
        userId,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        headline: headline?.trim() || null,
        bio: bio?.trim() || null,
        phone: phone?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        currentJobTitle: currentJobTitle?.trim() || null,
        graduationYear:
          graduationYear !== undefined &&
          graduationYear !== null &&
          graduationYear !== ""
            ? Number(graduationYear)
            : null,
        collegeId: collegeId || null,
        departmentId: departmentId || null,
        batchId: batchId || null,
        isVerified: !!isVerified,
        isOpenToWork: !!isOpenToWork,
        isMentor: !!isMentor,
      });
    } catch (profileError: any) {
      // Rollback: delete user if profile fails
      console.error("[ALUMNI_CREATE_PROFILE]", profileError);
      // Best-effort cleanup
      await auth.api
        .signOut({ headers: await headers() })
        .catch(() => {});

      return NextResponse.json(
        {
          success: false,
          error:
            "User created but profile setup failed. Please retry or check DB.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Alumni account created",
        data: { userId, email: signupResponse.user.email },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_CREATE]", error);

    // Duplicate email
    let current = error;
    while (current) {
      if (current.code === "23505" || current.message?.includes("unique")) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      current = current.cause;
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create alumni account",
      },
      { status: 500 }
    );
  }
}