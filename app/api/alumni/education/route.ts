import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alumniEducation } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireAlumni() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "alumni") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export async function POST(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const {
      collegeName,
      degree,
      fieldOfStudy,
      startYear,
      endYear,
      description,
    } = body;

    if (!collegeName?.trim()) {
      return NextResponse.json(
        { success: false, error: "College name is required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(alumniEducation)
      .values({
        id,
        userId: guard.session.user.id,
        collegeName: collegeName.trim(),
        degree: degree?.trim() || null,
        fieldOfStudy: fieldOfStudy?.trim() || null,
        startYear:
          startYear !== undefined && startYear !== "" && startYear !== null
            ? Number(startYear)
            : null,
        endYear:
          endYear !== undefined && endYear !== "" && endYear !== null
            ? Number(endYear)
            : null,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Education added" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_EDU_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed" },
      { status: 500 }
    );
  }
}