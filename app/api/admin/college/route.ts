import { auth } from "@/lib/auth";
import { db } from "@/db";
import { colleges } from "@/db/schema";
import { desc, ilike, or, eq } from "drizzle-orm";
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

/* ---------- Unique violation helper ---------- */
function isUniqueViolation(err: any): boolean {
  let current = err;
  while (current) {
    if (current.code === "23505") return true;
    current = current.cause;
  }
  return false;
}

/* ---------- GET: list colleges ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  try {
    const rows = await db
      .select()
      .from(colleges)
      .where(
        q
          ? or(
              ilike(colleges.name, `%${q}%`),
              ilike(colleges.shortName, `%${q}%`),
              ilike(colleges.city, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(colleges.createdAt));

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("[COLLEGES_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create college ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const {
      name,
      shortName,
      description,
      website,
      logo,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "College name is required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(colleges)
      .values({
        id,
        name: name.trim(),
        shortName: shortName?.trim() || null,
        description: description?.trim() || null,
        website: website?.trim() || null,
        logo: logo?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || "India",
        postalCode: postalCode?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "College created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[COLLEGES_POST]", error);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, error: "A college with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create college" },
      { status: 500 }
    );
  }
}