import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
    user as userTable,
    alumniProfiles,
    colleges,
    departments,
    batches,
    connections,
} from "@/db/schema";
import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { AlumniDirectoryItem } from "@/app/dashboard/directory/directory-types";

async function requireAlumni() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized", status: 401 };
    if ((session.user as any).role !== "alumni") {
        return { error: "Forbidden", status: 403 };
    }
    return { session };
}

export async function GET(req: NextRequest) {
    const guard = await requireAlumni();
    if ("error" in guard) {
        return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const currentUserId = guard.session.user.id;
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const collegeId = searchParams.get("collegeId");
    const departmentId = searchParams.get("departmentId");
    const batchId = searchParams.get("batchId");
    const verifiedOnly = searchParams.get("verified") === "true";
    const mentorsOnly = searchParams.get("mentors") === "true";
    const openToWorkOnly = searchParams.get("openToWork") === "true";

    try {
        /* ---------- Build where conditions ---------- */
        const conditions = [
            eq(userTable.role, "alumni"),
            ne(userTable.id, currentUserId), // exclude self
        ];

        if (q) {
            conditions.push(
                or(
                    ilike(userTable.name, `%${q}%`),
                    ilike(alumniProfiles.headline, `%${q}%`),
                    ilike(alumniProfiles.currentJobTitle, `%${q}%`),
                    ilike(alumniProfiles.city, `%${q}%`)
                )!
            );
        }

        if (collegeId) {
            conditions.push(eq(alumniProfiles.collegeId, collegeId));
        }
        if (departmentId) {
            conditions.push(eq(alumniProfiles.departmentId, departmentId));
        }
        if (batchId) {
            conditions.push(eq(alumniProfiles.batchId, batchId));
        }
        if (verifiedOnly) {
            conditions.push(eq(alumniProfiles.isVerified, true));
        }
        if (mentorsOnly) {
            conditions.push(eq(alumniProfiles.isMentor, true));
        }
        if (openToWorkOnly) {
            conditions.push(eq(alumniProfiles.isOpenToWork, true));
        }

        /* ---------- Fetch alumni ---------- */
        const rows = await db
            .select({
                id: userTable.id,
                name: userTable.name,
                email: userTable.email,
                image: userTable.image,

                firstName: alumniProfiles.firstName,
                lastName: alumniProfiles.lastName,
                headline: alumniProfiles.headline,
                bio: alumniProfiles.bio,
                city: alumniProfiles.city,
                state: alumniProfiles.state,
                country: alumniProfiles.country,
                currentJobTitle: alumniProfiles.currentJobTitle,
                graduationYear: alumniProfiles.graduationYear,

                collegeName: colleges.name,
                departmentName: departments.name,
                batchYear: batches.year,

                isVerified: alumniProfiles.isVerified,
                isMentor: alumniProfiles.isMentor,
                isOpenToWork: alumniProfiles.isOpenToWork,
            })
            .from(userTable)
            .leftJoin(alumniProfiles, eq(alumniProfiles.userId, userTable.id))
            .leftJoin(colleges, eq(alumniProfiles.collegeId, colleges.id))
            .leftJoin(
                departments,
                eq(alumniProfiles.departmentId, departments.id)
            )
            .leftJoin(batches, eq(alumniProfiles.batchId, batches.id))
            .where(and(...conditions))
            .orderBy(desc(userTable.createdAt))
            .limit(200);

        /* ---------- Fetch connection statuses ---------- */
        const ids = rows.map((r) => r.id);

        let connectionMap: Record<
            string,
            { status: string; id: string; requesterId: string }
        > = {};

        if (ids.length > 0) {
            const conns = await db
                .select({
                    id: connections.id,
                    requesterId: connections.requesterId,
                    receiverId: connections.receiverId,
                    status: connections.status,
                })
                .from(connections)
                .where(
                    and(
                        or(
                            eq(connections.requesterId, currentUserId),
                            eq(connections.receiverId, currentUserId)
                        ),
                        or(
                            inArray(connections.requesterId, ids),
                            inArray(connections.receiverId, ids)
                        )
                    )
                );

            for (const c of conns) {
                const otherId =
                    c.requesterId === currentUserId ? c.receiverId : c.requesterId;

                connectionMap[otherId] = {
                    status: c.status,
                    id: c.id,
                    requesterId: c.requesterId,
                };
            }
        }

        /* ---------- Build final response ---------- */
        const data = rows.map((r) => {
            const conn = connectionMap[r.id];

            let connectionStatus: AlumniDirectoryItem["connectionStatus"] =
                "none";
            let connectionId: string | null = null;

            if (conn) {
                connectionId = conn.id;
                if (conn.status === "accepted") {
                    connectionStatus = "accepted";
                } else if (conn.status === "pending") {
                    connectionStatus =
                        conn.requesterId === currentUserId
                            ? "pending_sent"
                            : "pending_received";
                }
            }

            return {
                ...r,
                connectionStatus,
                connectionId,
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[ALUMNI_DIRECTORY_GET]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch" },
            { status: 500 }
        );
    }
}