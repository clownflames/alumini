import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const userId = guard.session.user.id;

  try {
    /* ---------- Fetch the application first ---------- */
    const [existing] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.id, id),
          eq(jobApplications.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    /* ---------- Only allow withdrawal if status is still "applied" ---------- */
    if (existing.status !== "applied") {
      return NextResponse.json(
        {
          success: false,
          error:
            "You can only withdraw applications that are still in 'Applied' status",
        },
        { status: 400 }
      );
    }

    await db
      .delete(jobApplications)
      .where(
        and(
          eq(jobApplications.id, id),
          eq(jobApplications.userId, userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Application withdrawn",
    });
  } catch (error: any) {
    console.error("[ALUMNI_APPLICATION_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Withdraw failed" },
      { status: 500 }
    );
  }
}