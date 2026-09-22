import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";

/* =========================================================
   ENUMS
========================================================= */

/* =========================================================
   ANNOUNCEMENTS
========================================================= */

export const announcementPriorityEnum = pgEnum("announcement_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const announcementAudienceEnum = pgEnum("announcement_audience", [
  "all",
  "alumni",
  "students",
  "faculty",
]);

export const userRoleEnum = pgEnum("user_role", [
  "alumni",
  "student",
  "admin",
  "super_admin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "pending",
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "pending",
  "accepted",
  "rejected",
  "blocked",
]);

export const postVisibilityEnum = pgEnum("post_visibility", [
  "public",
  "connections",
  "private",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "in_person",
  "online",
  "hybrid",
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "internship",
  "contract",
  "freelance",
]);

export const jobExperienceEnum = pgEnum("job_experience", [
  "entry",
  "mid",
  "senior",
  "lead",
]);

export const mentorshipStatusEnum = pgEnum("mentorship_status", [
  "pending",
  "active",
  "completed",
  "cancelled",
]);

export const mentorshipFocusEnum = pgEnum("mentorship_focus", [
  "career",
  "academics",
  "entrepreneurship",
  "higher_studies",
  "general",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "reviewing",
  "shortlisted",
  "rejected",
  "accepted",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "file",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "system",
  "connection",
  "message",
  "event",
  "job",
  "post",
]);

export const donationStatusEnum = pgEnum("donation_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);



export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "approved",
  "rejected",
]);

export const verificationRequests = pgTable(
  "verification_requests",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    collegeId: text("college_id").references(() => colleges.id, {
      onDelete: "set null",
    }),

    departmentId: text("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),

    batchId: text("batch_id").references(() => batches.id, {
      onDelete: "set null",
    }),

    // User submitted data
    fullName: text("full_name").notNull(),

    graduationYear: integer("graduation_year"),

    rollNumber: text("roll_number"),

    documentUrl: text("document_url"),

    additionalInfo: text("additional_info"),

    // Admin review
    status: verificationStatusEnum("status").default("pending").notNull(),

    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "set null",
    }),

    reviewedAt: timestamp("reviewed_at"),

    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_user_idx").on(table.userId),
    index("verification_status_idx").on(table.status),
    index("verification_created_idx").on(table.createdAt),
    uniqueIndex("verification_user_unique_idx").on(table.userId),
  ]
);
/* =========================================================
   BETTER AUTH
========================================================= */

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    email: text("email").notNull().unique(),

    emailVerified: boolean("email_verified")
      .default(false)
      .notNull(),

    image: text("image"),

    // Application-level fields
    role: userRoleEnum("role").default("alumni").notNull(),

    status: userStatusEnum("status")
      .default("active")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_role_idx").on(table.role),
    index("user_status_idx").on(table.status),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at").notNull(),

    token: text("token").notNull().unique(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
  ],
);


export const mentorships = pgTable(
  "mentorships",
  {
    id: text("id").primaryKey(),

    mentorId: text("mentor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    menteeId: text("mentee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    collegeId: text("college_id").references(() => colleges.id, {
      onDelete: "set null",
    }),

    focus: mentorshipFocusEnum("focus").default("general").notNull(),

    status: mentorshipStatusEnum("status").default("pending").notNull(),

    requestMessage: text("request_message"),

    goal: text("goal"),

    startedAt: timestamp("started_at"),

    endedAt: timestamp("ended_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("mentorship_mentor_idx").on(table.mentorId),
    index("mentorship_mentee_idx").on(table.menteeId),
    index("mentorship_status_idx").on(table.status),
    index("mentorship_college_idx").on(table.collegeId),
    uniqueIndex("mentorship_pair_idx").on(
      table.mentorId,
      table.menteeId
    ),
  ]
);

export const mentorshipRelations = relations(
  mentorships,
  ({ one }) => ({
    mentor: one(user, {
      fields: [mentorships.mentorId],
      references: [user.id],
      relationName: "mentor",
    }),
    mentee: one(user, {
      fields: [mentorships.menteeId],
      references: [user.id],
      relationName: "mentee",
    }),
    college: one(colleges, {
      fields: [mentorships.collegeId],
      references: [colleges.id],
    }),
  })
);


export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    accountId: text("account_id").notNull(),

    providerId: text("provider_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    accessToken: text("access_token"),

    refreshToken: text("refresh_token"),

    idToken: text("id_token"),

    accessTokenExpiresAt: timestamp(
      "access_token_expires_at",
    ),

    refreshTokenExpiresAt: timestamp(
      "refresh_token_expires_at",
    ),

    scope: text("scope"),

    password: text("password"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    identifier: text("identifier").notNull(),

    value: text("value").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(
      table.identifier,
    ),
  ],
);

/* =========================================================
   COLLEGES
========================================================= */

export const colleges = pgTable(
  "colleges",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    shortName: text("short_name"),

    description: text("description"),

    website: text("website"),

    logo: text("logo"),

    email: text("email"),

    phone: text("phone"),

    address: text("address"),

    city: text("city"),

    state: text("state"),

    country: text("country").default("India"),

    postalCode: text("postal_code"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("college_name_idx").on(table.name),
    index("college_city_idx").on(table.city),
  ],
);

/* =========================================================
   DEPARTMENTS
========================================================= */

export const departments = pgTable(
  "departments",
  {
    id: text("id").primaryKey(),

    collegeId: text("college_id")
      .notNull()
      .references(() => colleges.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    code: text("code"),

    description: text("description"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("department_college_idx").on(table.collegeId),
    uniqueIndex("department_college_name_idx").on(
      table.collegeId,
      table.name,
    ),
  ],
);

/* =========================================================
   BATCHES
========================================================= */

export const batches = pgTable(
  "batches",
  {
    id: text("id").primaryKey(),

    collegeId: text("college_id")
      .notNull()
      .references(() => colleges.id, {
        onDelete: "cascade",
      }),

    year: integer("year").notNull(),

    startYear: integer("start_year"),

    endYear: integer("end_year"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("batch_college_idx").on(table.collegeId),
    index("batch_year_idx").on(table.year),
    uniqueIndex("batch_college_year_idx").on(
      table.collegeId,
      table.year,
    ),
  ],
);

/* =========================================================
   ALUMNI PROFILE
========================================================= */

export const alumniProfiles = pgTable(
  "alumni_profiles",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    collegeId: text("college_id")
      .references(() => colleges.id, {
        onDelete: "set null",
      }),

    departmentId: text("department_id")
      .references(() => departments.id, {
        onDelete: "set null",
      }),

    batchId: text("batch_id")
      .references(() => batches.id, {
        onDelete: "set null",
      }),

    firstName: text("first_name"),

    lastName: text("last_name"),

    headline: text("headline"),

    bio: text("bio"),

    phone: text("phone"),

    dateOfBirth: timestamp("date_of_birth"),

    gender: text("gender"),

    city: text("city"),

    state: text("state"),

    country: text("country"),

    postalCode: text("postal_code"),

    currentJobTitle: text("current_job_title"),

    currentCompanyId: text("current_company_id"),

    graduationYear: integer("graduation_year"),

    profileCompleted: boolean("profile_completed")
      .default(false)
      .notNull(),

    isVerified: boolean("is_verified")
      .default(false)
      .notNull(),

    isOpenToWork: boolean("is_open_to_work")
      .default(false)
      .notNull(),

    isMentor: boolean("is_mentor")
      .default(false)
      .notNull(),

    allowMessages: boolean("allow_messages")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("alumni_college_idx").on(table.collegeId),
    index("alumni_department_idx").on(table.departmentId),
    index("alumni_batch_idx").on(table.batchId),
    index("alumni_city_idx").on(table.city),
    index("alumni_company_idx").on(table.currentCompanyId),
    index("alumni_graduation_idx").on(
      table.graduationYear,
    ),
  ],
);

/* =========================================================
   COMPANIES
========================================================= */

export const companies = pgTable(
  "companies",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    logo: text("logo"),

    website: text("website"),

    description: text("description"),

    industry: text("industry"),

    size: text("size"),

    city: text("city"),

    state: text("state"),

    country: text("country"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("company_name_idx").on(table.name),
    index("company_industry_idx").on(table.industry),
  ],
);

/* =========================================================
   EDUCATION
========================================================= */

export const alumniEducation = pgTable(
  "alumni_education",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    collegeName: text("college_name").notNull(),

    degree: text("degree"),

    fieldOfStudy: text("field_of_study"),

    startYear: integer("start_year"),

    endYear: integer("end_year"),

    description: text("description"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("education_user_idx").on(table.userId),
  ],
);

/* =========================================================
   WORK EXPERIENCE
========================================================= */

export const alumniExperience = pgTable(
  "alumni_experience",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    companyId: text("company_id")
      .references(() => companies.id, {
        onDelete: "set null",
      }),

    companyName: text("company_name").notNull(),

    jobTitle: text("job_title").notNull(),

    location: text("location"),

    startDate: timestamp("start_date"),

    endDate: timestamp("end_date"),

    currentlyWorking: boolean("currently_working")
      .default(false)
      .notNull(),

    description: text("description"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("experience_user_idx").on(table.userId),
    index("experience_company_idx").on(table.companyId),
  ],
);

/* =========================================================
   SKILLS
========================================================= */

export const skills = pgTable(
  "skills",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull().unique(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("skill_name_idx").on(table.name),
  ],
);

export const alumniSkills = pgTable(
  "alumni_skills",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.skillId],
    }),
  ],
);

/* =========================================================
   SOCIAL LINKS
========================================================= */

export const socialLinks = pgTable(
  "social_links",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    platform: text("platform").notNull(),

    url: text("url").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("social_links_user_idx").on(table.userId),
  ],
);

/* =========================================================
   CONNECTIONS
========================================================= */

export const connections = pgTable(
  "connections",
  {
    id: text("id").primaryKey(),

    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    status: connectionStatusEnum("status")
      .default("pending")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("connection_requester_idx").on(
      table.requesterId,
    ),

    index("connection_receiver_idx").on(
      table.receiverId,
    ),

    uniqueIndex("connection_pair_idx").on(
      table.requesterId,
      table.receiverId,
    ),
  ],
);

/* =========================================================
   POSTS
========================================================= */

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    image: text("image"),

    visibility: postVisibilityEnum("visibility")
      .default("public")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_user_idx").on(table.userId),
    index("post_created_idx").on(table.createdAt),
  ],
);

/* =========================================================
   POST LIKES
========================================================= */

export const postLikes = pgTable(
  "post_likes",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.postId, table.userId],
    }),
  ],
);

/* =========================================================
   POST COMMENTS
========================================================= */

export const postComments = pgTable(
  "post_comments",
  {
    id: text("id").primaryKey(),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("comment_post_idx").on(table.postId),
    index("comment_user_idx").on(table.userId),
  ],
);

/* =========================================================
   EVENTS
========================================================= */

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),

    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    collegeId: text("college_id")
      .references(() => colleges.id, {
        onDelete: "set null",
      }),

    title: text("title").notNull(),

    description: text("description"),

    coverImage: text("cover_image"),

    eventType: eventTypeEnum("event_type")
      .default("in_person")
      .notNull(),

    status: eventStatusEnum("status")
      .default("draft")
      .notNull(),

    startAt: timestamp("start_at").notNull(),

    endAt: timestamp("end_at"),

    location: text("location"),

    meetingUrl: text("meeting_url"),

    maxAttendees: integer("max_attendees"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_creator_idx").on(table.createdBy),
    index("event_college_idx").on(table.collegeId),
    index("event_start_idx").on(table.startAt),
    index("event_status_idx").on(table.status),
  ],
);

/* =========================================================
   EVENT REGISTRATIONS
========================================================= */

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    registeredAt: timestamp("registered_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.eventId, table.userId],
    }),

    index("event_registration_user_idx").on(
      table.userId,
    ),
  ],
);

/* =========================================================
   JOBS
========================================================= */

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(),

    postedBy: text("posted_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    companyId: text("company_id")
      .references(() => companies.id, {
        onDelete: "set null",
      }),

    title: text("title").notNull(),

    description: text("description").notNull(),

    location: text("location"),

    remote: boolean("remote")
      .default(false)
      .notNull(),

    jobType: jobTypeEnum("job_type")
      .default("full_time")
      .notNull(),

    experienceLevel: jobExperienceEnum(
      "experience_level",
    ),

    salaryMin: integer("salary_min"),

    salaryMax: integer("salary_max"),

    salaryCurrency: text("salary_currency")
      .default("INR"),

    applicationUrl: text("application_url"),

    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("job_posted_by_idx").on(table.postedBy),
    index("job_company_idx").on(table.companyId),
    index("job_type_idx").on(table.jobType),
    index("job_location_idx").on(table.location),
    index("job_created_idx").on(table.createdAt),
  ],
);

/* =========================================================
   JOB APPLICATIONS
========================================================= */

export const jobApplications = pgTable(
  "job_applications",
  {
    id: text("id").primaryKey(),

    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    resumeUrl: text("resume_url"),

    coverLetter: text("cover_letter"),

    status: applicationStatusEnum("status")
      .default("applied")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("application_job_idx").on(table.jobId),
    index("application_user_idx").on(table.userId),

    uniqueIndex("job_user_application_idx").on(
      table.jobId,
      table.userId,
    ),
  ],
);

/* =========================================================
   CONVERSATIONS
========================================================= */

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);

/* =========================================================
   CONVERSATION MEMBERS
========================================================= */

export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    joinedAt: timestamp("joined_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.conversationId,
        table.userId,
      ],
    }),

    index("conversation_member_user_idx").on(
      table.userId,
    ),
  ],
);

/* =========================================================
   MESSAGES
========================================================= */

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),

    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),

    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    content: text("content"),

    type: messageTypeEnum("type")
      .default("text")
      .notNull(),

    attachmentUrl: text("attachment_url"),

    isRead: boolean("is_read")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("message_conversation_idx").on(
      table.conversationId,
    ),

    index("message_sender_idx").on(
      table.senderId,
    ),

    index("message_created_idx").on(
      table.createdAt,
    ),
  ],
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    type: notificationTypeEnum("type")
      .default("system")
      .notNull(),

    title: text("title").notNull(),

    message: text("message"),

    link: text("link"),

    isRead: boolean("is_read")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notification_user_idx").on(table.userId),
    index("notification_created_idx").on(
      table.createdAt,
    ),
    index("notification_read_idx").on(
      table.userId,
      table.isRead,
    ),
  ],
);

/* =========================================================
   DONATIONS
========================================================= */

export const donations = pgTable(
  "donations",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .references(() => user.id, {
        onDelete: "set null",
      }),

    collegeId: text("college_id")
      .references(() => colleges.id, {
        onDelete: "set null",
      }),

    amount: integer("amount").notNull(),

    currency: text("currency")
      .default("INR")
      .notNull(),

    status: donationStatusEnum("status")
      .default("pending")
      .notNull(),

    paymentProvider: text("payment_provider"),

    paymentId: text("payment_id"),

    message: text("message"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("donation_user_idx").on(table.userId),
    index("donation_college_idx").on(table.collegeId),
    index("donation_status_idx").on(table.status),
  ],
);

/* =========================================================
   BETTER AUTH RELATIONS
========================================================= */

export const userRelations = relations(
  user,
  ({ many, one }) => ({
    sessions: many(session),

    accounts: many(account),

    alumniProfile: one(alumniProfiles),

    mentorshipsAsMentor: many(mentorships, {
      relationName: "mentor",
    }),
    mentorshipsAsMentee: many(mentorships, {
      relationName: "mentee",
    }),

    education: many(alumniEducation),

    announcements: many(announcements),   // ← ye add karo
    experience: many(alumniExperience),

    skills: many(alumniSkills),

    socialLinks: many(socialLinks),

    sentConnections: many(connections, {
      relationName: "requester",
    }),

    receivedConnections: many(connections, {
      relationName: "receiver",
    }),

    posts: many(posts),

    postLikes: many(postLikes),

    comments: many(postComments),

    events: many(events),

    eventRegistrations: many(eventRegistrations),

    jobs: many(jobs),

    jobApplications: many(jobApplications),

    notifications: many(notifications),

    messages: many(messages),

    conversationMembers: many(
      conversationMembers,
    ),

    donations: many(donations),
  }),
);

export const sessionRelations = relations(
  session,
  ({ one }) => ({
    user: one(user, {
      fields: [session.userId],
      references: [user.id],
    }),
  }),
);

export const accountRelations = relations(
  account,
  ({ one }) => ({
    user: one(user, {
      fields: [account.userId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   COLLEGE RELATIONS
========================================================= */

export const collegeRelations = relations(
  colleges,
  ({ many }) => ({
    departments: many(departments),

    batches: many(batches),

    alumniProfiles: many(alumniProfiles),
    announcements: many(announcements),   // ← ye add karo
    mentorships: many(mentorships),
    events: many(events),

    donations: many(donations),
  }),
);

export const departmentRelations = relations(
  departments,
  ({ one, many }) => ({
    college: one(colleges, {
      fields: [departments.collegeId],
      references: [colleges.id],
    }),

    alumniProfiles: many(alumniProfiles),
    branches: many(branches),   // ← ye add karo
  }),
);

export const batchRelations = relations(
  batches,
  ({ one, many }) => ({
    college: one(colleges, {
      fields: [batches.collegeId],
      references: [colleges.id],
    }),

    alumniProfiles: many(alumniProfiles),
  }),
);

/* =========================================================
   ALUMNI RELATIONS
========================================================= */

export const alumniProfileRelations = relations(
  alumniProfiles,
  ({ one }) => ({
    user: one(user, {
      fields: [alumniProfiles.userId],
      references: [user.id],
    }),

    college: one(colleges, {
      fields: [alumniProfiles.collegeId],
      references: [colleges.id],
    }),

    department: one(departments, {
      fields: [alumniProfiles.departmentId],
      references: [departments.id],
    }),

    batch: one(batches, {
      fields: [alumniProfiles.batchId],
      references: [batches.id],
    }),

    company: one(companies, {
      fields: [alumniProfiles.currentCompanyId],
      references: [companies.id],
    }),
  }),
);

/* =========================================================
   COMPANY RELATIONS
========================================================= */

export const companyRelations = relations(
  companies,
  ({ many }) => ({
    alumni: many(alumniProfiles),

    experiences: many(alumniExperience),

    jobs: many(jobs),
  }),
);

/* =========================================================
   EDUCATION / EXPERIENCE / SKILLS
========================================================= */

export const educationRelations = relations(
  alumniEducation,
  ({ one }) => ({
    user: one(user, {
      fields: [alumniEducation.userId],
      references: [user.id],
    }),
  }),
);

export const experienceRelations = relations(
  alumniExperience,
  ({ one }) => ({
    user: one(user, {
      fields: [alumniExperience.userId],
      references: [user.id],
    }),

    company: one(companies, {
      fields: [alumniExperience.companyId],
      references: [companies.id],
    }),
  }),
);

export const skillRelations = relations(
  skills,
  ({ many }) => ({
    alumni: many(alumniSkills),
  }),
);

export const alumniSkillRelations = relations(
  alumniSkills,
  ({ one }) => ({
    user: one(user, {
      fields: [alumniSkills.userId],
      references: [user.id],
    }),

    skill: one(skills, {
      fields: [alumniSkills.skillId],
      references: [skills.id],
    }),
  }),
);

export const socialLinkRelations = relations(
  socialLinks,
  ({ one }) => ({
    user: one(user, {
      fields: [socialLinks.userId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   CONNECTION RELATIONS
========================================================= */

export const connectionRelations = relations(
  connections,
  ({ one }) => ({
    requester: one(user, {
      fields: [connections.requesterId],
      references: [user.id],
      relationName: "requester",
    }),

    receiver: one(user, {
      fields: [connections.receiverId],
      references: [user.id],
      relationName: "receiver",
    }),
  }),
);

/* =========================================================
   POST RELATIONS
========================================================= */

export const postRelations = relations(
  posts,
  ({ one, many }) => ({
    user: one(user, {
      fields: [posts.userId],
      references: [user.id],
    }),

    likes: many(postLikes),

    comments: many(postComments),
  }),
);

export const postLikeRelations = relations(
  postLikes,
  ({ one }) => ({
    post: one(posts, {
      fields: [postLikes.postId],
      references: [posts.id],
    }),

    user: one(user, {
      fields: [postLikes.userId],
      references: [user.id],
    }),
  }),
);

export const postCommentRelations = relations(
  postComments,
  ({ one }) => ({
    post: one(posts, {
      fields: [postComments.postId],
      references: [posts.id],
    }),

    user: one(user, {
      fields: [postComments.userId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   EVENT RELATIONS
========================================================= */

export const eventRelations = relations(
  events,
  ({ one, many }) => ({
    creator: one(user, {
      fields: [events.createdBy],
      references: [user.id],
    }),

    college: one(colleges, {
      fields: [events.collegeId],
      references: [colleges.id],
    }),

    registrations: many(eventRegistrations),
  }),
);

export const eventRegistrationRelations = relations(
  eventRegistrations,
  ({ one }) => ({
    event: one(events, {
      fields: [eventRegistrations.eventId],
      references: [events.id],
    }),

    user: one(user, {
      fields: [eventRegistrations.userId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   JOB RELATIONS
========================================================= */

export const jobRelations = relations(
  jobs,
  ({ one, many }) => ({
    poster: one(user, {
      fields: [jobs.postedBy],
      references: [user.id],
    }),

    company: one(companies, {
      fields: [jobs.companyId],
      references: [companies.id],
    }),

    applications: many(jobApplications),
  }),
);

export const jobApplicationRelations = relations(
  jobApplications,
  ({ one }) => ({
    job: one(jobs, {
      fields: [jobApplications.jobId],
      references: [jobs.id],
    }),

    user: one(user, {
      fields: [jobApplications.userId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   CHAT RELATIONS
========================================================= */

export const conversationRelations = relations(
  conversations,
  ({ many }) => ({
    members: many(conversationMembers),

    messages: many(messages),
  }),
);

export const conversationMemberRelations =
  relations(
    conversationMembers,
    ({ one }) => ({
      conversation: one(conversations, {
        fields: [conversationMembers.conversationId],
        references: [conversations.id],
      }),

      user: one(user, {
        fields: [conversationMembers.userId],
        references: [user.id],
      }),
    }),
  );

export const messageRelations = relations(
  messages,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [messages.conversationId],
      references: [conversations.id],
    }),

    sender: one(user, {
      fields: [messages.senderId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   NOTIFICATION RELATIONS
========================================================= */

export const notificationRelations = relations(
  notifications,
  ({ one }) => ({
    user: one(user, {
      fields: [notifications.userId],
      references: [user.id],
    }),
  }),
);

/* =========================================================
   DONATION RELATIONS
========================================================= */

export const donationRelations = relations(
  donations,
  ({ one }) => ({
    user: one(user, {
      fields: [donations.userId],
      references: [user.id],
    }),

    college: one(colleges, {
      fields: [donations.collegeId],
      references: [colleges.id],
    }),
  }),
);




export const verificationRequestRelations = relations(
  verificationRequests,
  ({ one }) => ({
    user: one(user, {
      fields: [verificationRequests.userId],
      references: [user.id],
    }),
    reviewer: one(user, {
      fields: [verificationRequests.reviewedBy],
      references: [user.id],
      relationName: "reviewer",
    }),
    college: one(colleges, {
      fields: [verificationRequests.collegeId],
      references: [colleges.id],
    }),
    department: one(departments, {
      fields: [verificationRequests.departmentId],
      references: [departments.id],
    }),
    batch: one(batches, {
      fields: [verificationRequests.batchId],
      references: [batches.id],
    }),
  })
);



/* =========================================================
   BRANCHES
========================================================= */

export const branches = pgTable(
  "branches",
  {
    id: text("id").primaryKey(),

    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    code: text("code"),

    description: text("description"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("branch_department_idx").on(table.departmentId),
    uniqueIndex("branch_department_name_idx").on(
      table.departmentId,
      table.name
    ),
  ]
);

/* =========================================================
   BRANCH RELATIONS
========================================================= */

export const branchRelations = relations(branches, ({ one }) => ({
  department: one(departments, {
    fields: [branches.departmentId],
    references: [departments.id],
  }),
}));


export const announcements = pgTable(
  "announcements",
  {
    id: text("id").primaryKey(),

    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    collegeId: text("college_id").references(() => colleges.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),

    content: text("content").notNull(),

    priority: announcementPriorityEnum("priority")
      .default("normal")
      .notNull(),

    audience: announcementAudienceEnum("audience")
      .default("all")
      .notNull(),

    isPinned: boolean("is_pinned")
      .default(false)
      .notNull(),

    isPublished: boolean("is_published")
      .default(false)
      .notNull(),

    publishedAt: timestamp("published_at"),

    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("announcement_creator_idx").on(table.createdBy),
    index("announcement_college_idx").on(table.collegeId),
    index("announcement_created_idx").on(table.createdAt),
    index("announcement_published_idx").on(table.isPublished),
    index("announcement_pinned_idx").on(table.isPinned),
  ]
);

export const announcementRelations = relations(
  announcements,
  ({ one }) => ({
    creator: one(user, {
      fields: [announcements.createdBy],
      references: [user.id],
    }),

    college: one(colleges, {
      fields: [announcements.collegeId],
      references: [colleges.id],
    }),
  })
);