import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),

    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const allowed = ["alumni", "student", "admin", "super_admin"];
                    const role = (user as any).role;
                    if (!role || !allowed.includes(role)) {
                        return { data: { ...user, role: "alumni" } };
                    }
                    return { data: user };
                },
            },
        },
    },

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "alumni",
                input: true, // allow client to pass during signup
            },
            status: {
                type: "string",
                required: false,
                defaultValue: "active",
                input: false,
            },
        },
    },

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
});

export type Session = typeof auth.$Infer.Session;