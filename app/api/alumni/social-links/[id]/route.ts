import { auth } from "@/lib/auth";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

  try {
    const [deleted] = await db
      .delete(socialLinks)
      .where(
        and(
          eq(socialLinks.id, id),
          eq(socialLinks.userId, guard.session.user.id)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Link deleted",
    });
  } catch (error: any) {
    console.error("[ALUMNI_SOCIAL_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}