CREATE TYPE "application_status" AS ENUM('applied', 'reviewing', 'shortlisted', 'rejected', 'accepted');--> statement-breakpoint
CREATE TYPE "connection_status" AS ENUM('pending', 'accepted', 'rejected', 'blocked');--> statement-breakpoint
CREATE TYPE "donation_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "event_status" AS ENUM('draft', 'published', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "event_type" AS ENUM('in_person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "job_experience" AS ENUM('entry', 'mid', 'senior', 'lead');--> statement-breakpoint
CREATE TYPE "job_type" AS ENUM('full_time', 'part_time', 'internship', 'contract', 'freelance');--> statement-breakpoint
CREATE TYPE "message_type" AS ENUM('text', 'image', 'file');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('system', 'connection', 'message', 'event', 'job', 'post');--> statement-breakpoint
CREATE TYPE "post_visibility" AS ENUM('public', 'connections', 'private');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('alumni', 'student', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('active', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_education" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"college_name" text NOT NULL,
	"degree" text,
	"field_of_study" text,
	"start_year" integer,
	"end_year" integer,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_experience" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"company_id" text,
	"company_name" text NOT NULL,
	"job_title" text NOT NULL,
	"location" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"currently_working" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_profiles" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"college_id" text,
	"department_id" text,
	"batch_id" text,
	"first_name" text,
	"last_name" text,
	"headline" text,
	"bio" text,
	"phone" text,
	"date_of_birth" timestamp,
	"gender" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"current_job_title" text,
	"current_company_id" text,
	"graduation_year" integer,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_open_to_work" boolean DEFAULT false NOT NULL,
	"is_mentor" boolean DEFAULT false NOT NULL,
	"allow_messages" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_skills" (
	"user_id" text,
	"skill_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alumni_skills_pkey" PRIMARY KEY("user_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" text PRIMARY KEY,
	"college_id" text NOT NULL,
	"year" integer NOT NULL,
	"start_year" integer,
	"end_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"short_name" text,
	"description" text,
	"website" text,
	"logo" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text DEFAULT 'India',
	"postal_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"logo" text,
	"website" text,
	"description" text,
	"industry" text,
	"size" text,
	"city" text,
	"state" text,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" text PRIMARY KEY,
	"requester_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending'::"connection_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_members" (
	"conversation_id" text,
	"user_id" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_members_pkey" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY,
	"college_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"college_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" "donation_status" DEFAULT 'pending'::"donation_status" NOT NULL,
	"payment_provider" text,
	"payment_id" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"event_id" text,
	"user_id" text,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_registrations_pkey" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"created_by" text NOT NULL,
	"college_id" text,
	"title" text NOT NULL,
	"description" text,
	"cover_image" text,
	"event_type" "event_type" DEFAULT 'in_person'::"event_type" NOT NULL,
	"status" "event_status" DEFAULT 'draft'::"event_status" NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"location" text,
	"meeting_url" text,
	"max_attendees" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" text PRIMARY KEY,
	"job_id" text NOT NULL,
	"user_id" text NOT NULL,
	"resume_url" text,
	"cover_letter" text,
	"status" "application_status" DEFAULT 'applied'::"application_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY,
	"posted_by" text NOT NULL,
	"company_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"remote" boolean DEFAULT false NOT NULL,
	"job_type" "job_type" DEFAULT 'full_time'::"job_type" NOT NULL,
	"experience_level" "job_experience",
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text DEFAULT 'INR',
	"application_url" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text,
	"type" "message_type" DEFAULT 'text'::"message_type" NOT NULL,
	"attachment_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"type" "notification_type" DEFAULT 'system'::"notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" text PRIMARY KEY,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"post_id" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_likes_pkey" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"image" text,
	"visibility" "post_visibility" DEFAULT 'public'::"post_visibility" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'alumni'::"user_role" NOT NULL,
	"status" "user_status" DEFAULT 'active'::"user_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"college_id" text,
	"department_id" text,
	"batch_id" text,
	"full_name" text NOT NULL,
	"graduation_year" integer,
	"roll_number" text,
	"document_url" text,
	"additional_info" text,
	"status" "verification_status" DEFAULT 'pending'::"verification_status" NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "education_user_idx" ON "alumni_education" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_user_idx" ON "alumni_experience" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_company_idx" ON "alumni_experience" ("company_id");--> statement-breakpoint
CREATE INDEX "alumni_college_idx" ON "alumni_profiles" ("college_id");--> statement-breakpoint
CREATE INDEX "alumni_department_idx" ON "alumni_profiles" ("department_id");--> statement-breakpoint
CREATE INDEX "alumni_batch_idx" ON "alumni_profiles" ("batch_id");--> statement-breakpoint
CREATE INDEX "alumni_city_idx" ON "alumni_profiles" ("city");--> statement-breakpoint
CREATE INDEX "alumni_company_idx" ON "alumni_profiles" ("current_company_id");--> statement-breakpoint
CREATE INDEX "alumni_graduation_idx" ON "alumni_profiles" ("graduation_year");--> statement-breakpoint
CREATE INDEX "batch_college_idx" ON "batches" ("college_id");--> statement-breakpoint
CREATE INDEX "batch_year_idx" ON "batches" ("year");--> statement-breakpoint
CREATE UNIQUE INDEX "batch_college_year_idx" ON "batches" ("college_id","year");--> statement-breakpoint
CREATE INDEX "college_name_idx" ON "colleges" ("name");--> statement-breakpoint
CREATE INDEX "college_city_idx" ON "colleges" ("city");--> statement-breakpoint
CREATE INDEX "company_name_idx" ON "companies" ("name");--> statement-breakpoint
CREATE INDEX "company_industry_idx" ON "companies" ("industry");--> statement-breakpoint
CREATE INDEX "connection_requester_idx" ON "connections" ("requester_id");--> statement-breakpoint
CREATE INDEX "connection_receiver_idx" ON "connections" ("receiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "connection_pair_idx" ON "connections" ("requester_id","receiver_id");--> statement-breakpoint
CREATE INDEX "conversation_member_user_idx" ON "conversation_members" ("user_id");--> statement-breakpoint
CREATE INDEX "department_college_idx" ON "departments" ("college_id");--> statement-breakpoint
CREATE UNIQUE INDEX "department_college_name_idx" ON "departments" ("college_id","name");--> statement-breakpoint
CREATE INDEX "donation_user_idx" ON "donations" ("user_id");--> statement-breakpoint
CREATE INDEX "donation_college_idx" ON "donations" ("college_id");--> statement-breakpoint
CREATE INDEX "donation_status_idx" ON "donations" ("status");--> statement-breakpoint
CREATE INDEX "event_registration_user_idx" ON "event_registrations" ("user_id");--> statement-breakpoint
CREATE INDEX "event_creator_idx" ON "events" ("created_by");--> statement-breakpoint
CREATE INDEX "event_college_idx" ON "events" ("college_id");--> statement-breakpoint
CREATE INDEX "event_start_idx" ON "events" ("start_at");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "events" ("status");--> statement-breakpoint
CREATE INDEX "application_job_idx" ON "job_applications" ("job_id");--> statement-breakpoint
CREATE INDEX "application_user_idx" ON "job_applications" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_user_application_idx" ON "job_applications" ("job_id","user_id");--> statement-breakpoint
CREATE INDEX "job_posted_by_idx" ON "jobs" ("posted_by");--> statement-breakpoint
CREATE INDEX "job_company_idx" ON "jobs" ("company_id");--> statement-breakpoint
CREATE INDEX "job_type_idx" ON "jobs" ("job_type");--> statement-breakpoint
CREATE INDEX "job_location_idx" ON "jobs" ("location");--> statement-breakpoint
CREATE INDEX "job_created_idx" ON "jobs" ("created_at");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "messages" ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_sender_idx" ON "messages" ("sender_id");--> statement-breakpoint
CREATE INDEX "message_created_idx" ON "messages" ("created_at");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "notification_created_idx" ON "notifications" ("created_at");--> statement-breakpoint
CREATE INDEX "notification_read_idx" ON "notifications" ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "comment_post_idx" ON "post_comments" ("post_id");--> statement-breakpoint
CREATE INDEX "comment_user_idx" ON "post_comments" ("user_id");--> statement-breakpoint
CREATE INDEX "post_user_idx" ON "posts" ("user_id");--> statement-breakpoint
CREATE INDEX "post_created_idx" ON "posts" ("created_at");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "skill_name_idx" ON "skills" ("name");--> statement-breakpoint
CREATE INDEX "social_links_user_idx" ON "social_links" ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" ("role");--> statement-breakpoint
CREATE INDEX "user_status_idx" ON "user" ("status");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "verification_user_idx" ON "verification_requests" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_status_idx" ON "verification_requests" ("status");--> statement-breakpoint
CREATE INDEX "verification_created_idx" ON "verification_requests" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_user_unique_idx" ON "verification_requests" ("user_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alumni_education" ADD CONSTRAINT "alumni_education_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alumni_experience" ADD CONSTRAINT "alumni_experience_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alumni_experience" ADD CONSTRAINT "alumni_experience_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_batch_id_batches_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "alumni_skills" ADD CONSTRAINT "alumni_skills_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "alumni_skills" ADD CONSTRAINT "alumni_skills_skill_id_skills_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_user_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiver_id_user_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_user_id_fkey" FOREIGN KEY ("posted_by") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_college_id_colleges_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_batch_id_batches_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;