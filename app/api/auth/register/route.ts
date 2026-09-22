import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_SIGNUP_ROLES = ["alumni", "student"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const safeRole = ALLOWED_SIGNUP_ROLES.includes(role) ? role : "alumni";

    const response = await auth.api.signUpEmail({
      body: { email, password, name, role: safeRole },
      asResponse: true,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}