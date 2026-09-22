import { auth } from "@/lib/auth";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
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
    const { platform, url } = body;

    if (!platform?.trim() || !url?.trim()) {
      return NextResponse.json(
        { success: false, error: "Platform and URL are required" },
        { status: 400 }
      );
    }

    if (!/^https?:\/\/.+/.test(url)) {
      return NextResponse.json(
        { success: false, error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(socialLinks)
      .values({
        id,
        userId: guard.session.user.id,
        platform: platform.trim(),
        url: url.trim(),
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Link added" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_SOCIAL_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed" },
      { status: 500 }
    );
  }
}