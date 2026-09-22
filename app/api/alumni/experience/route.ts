import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alumniExperience } from "@/db/schema";
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
      companyName,
      jobTitle,
      location,
      startDate,
      endDate,
      currentlyWorking,
      description,
    } = body;

    if (!companyName?.trim() || !jobTitle?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Company name and job title are required",
        },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(alumniExperience)
      .values({
        id,
        userId: guard.session.user.id,
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        location: location?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        currentlyWorking: !!currentlyWorking,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Experience added" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_EXP_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed" },
      { status: 500 }
    );
  }
}