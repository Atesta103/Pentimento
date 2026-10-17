CREATE TYPE "public"."assignment_status" AS ENUM('to_submit', 'awaiting_review', 'changes_requested', 'approved');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('teacher', 'student');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('submission_received', 'changes_requested', 'approved');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"deliverable_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"status" "assignment_status" DEFAULT 'to_submit' NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_by_id" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_assignments_deliverable_id_group_id" UNIQUE("deliverable_id","group_id"),
	CONSTRAINT "ck_assignments_approval_both_or_none" CHECK (("assignments"."approved_at" is null) = ("assignments"."approved_by_id" is null)),
	CONSTRAINT "ck_assignments_approval_only_when_approved" CHECK ("assignments"."approved_at" is null or "assignments"."status" = 'approved')
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"needs_fix" boolean DEFAULT false NOT NULL,
	"resolved_by_id" uuid,
	"resolved_at" timestamp with time zone,
	"anchor" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone,
	CONSTRAINT "ck_comments_resolution_both_or_none" CHECK (("comments"."resolved_at" is null) = ("comments"."resolved_by_id" is null))
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"template_id" uuid,
	"title" text NOT NULL,
	"instructions" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_deliverables_project_id_id" UNIQUE("project_id","id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_groups_project_id_id" UNIQUE("project_id","id")
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_institutions_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"payload" jsonb NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	CONSTRAINT "ck_notifications_attempt_count_non_negative" CHECK ("notifications"."attempt_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"group_id" uuid,
	"role" "member_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_project_members_project_id_user_id" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid,
	"created_by_id" uuid NOT NULL,
	"title" text NOT NULL,
	"brief" text NOT NULL,
	"objectives" text,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"invite_code" text NOT NULL,
	"invite_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_projects_invite_code" UNIQUE("invite_code"),
	CONSTRAINT "ck_projects_ends_on_after_starts_on" CHECK ("projects"."ends_on" >= "projects"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "status_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"submission_id" uuid,
	"changed_by_id" uuid NOT NULL,
	"from_status" "assignment_status" NOT NULL,
	"to_status" "assignment_status" NOT NULL,
	"note" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_status_changes_from_differs_to" CHECK ("status_changes"."from_status" <> "status_changes"."to_status")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"submitted_by_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"note" text,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_submissions_assignment_id_version_number" UNIQUE("assignment_id","version_number"),
	CONSTRAINT "ck_submissions_version_number_positive" CHECK ("submissions"."version_number" >= 1),
	CONSTRAINT "ck_submissions_size_bytes_positive" CHECK ("submissions"."size_bytes" > 0),
	CONSTRAINT "ck_submissions_checksum_sha256_format" CHECK ("submissions"."checksum_sha256" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"locale" text NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution_id" uuid,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"locale" text DEFAULT 'fr' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_users_email" UNIQUE("email"),
	CONSTRAINT "ck_users_email_lowercase" CHECK ("users"."email" = lower("users"."email")),
	CONSTRAINT "ck_users_locale" CHECK ("users"."locale" in ('fr', 'en'))
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "fk_assignments_project_id_deliverable_id" FOREIGN KEY ("project_id","deliverable_id") REFERENCES "public"."deliverables"("project_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "fk_assignments_project_id_group_id" FOREIGN KEY ("project_id","group_id") REFERENCES "public"."groups"("project_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "fk_assignments_approved_by_id" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "fk_comments_submission_id" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "fk_comments_author_id" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "fk_comments_resolved_by_id" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "fk_deliverables_project_id" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "fk_deliverables_template_id" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "fk_groups_project_id" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members_project_id" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members_project_id_group_id" FOREIGN KEY ("project_id","group_id") REFERENCES "public"."groups"("project_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_institution_id" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_created_by_id" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_changes" ADD CONSTRAINT "fk_status_changes_assignment_id" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_changes" ADD CONSTRAINT "fk_status_changes_submission_id" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_changes" ADD CONSTRAINT "fk_status_changes_changed_by_id" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "fk_submissions_assignment_id" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "fk_submissions_submitted_by_id" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "fk_templates_institution_id" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "fk_users_institution_id" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assignments_group_id_status" ON "assignments" USING btree ("group_id","status");--> statement-breakpoint
CREATE INDEX "idx_assignments_status_last_activity_at" ON "assignments" USING btree ("status","last_activity_at");--> statement-breakpoint
CREATE INDEX "idx_assignments_project_id_status" ON "assignments" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "idx_comments_submission_id" ON "comments" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_deliverables_project_id_sort_order" ON "deliverables" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id_sent_at" ON "notifications" USING btree ("user_id","sent_at");--> statement-breakpoint
CREATE INDEX "idx_project_members_user_id" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_project_members_group_id" ON "project_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_status_changes_assignment_id_changed_at" ON "status_changes" USING btree ("assignment_id","changed_at");