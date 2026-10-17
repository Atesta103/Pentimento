import { pgEnum } from "drizzle-orm/pg-core";

// Valeurs : docs/data/erd.md, « Types énumérés ». Ajouter une valeur = une migration.
export const projectStatus = pgEnum("project_status", [
  "draft",
  "active",
  "archived",
]);

export const memberRole = pgEnum("member_role", ["teacher", "student"]);

export const assignmentStatus = pgEnum("assignment_status", [
  "to_submit",
  "awaiting_review",
  "changes_requested",
  "approved",
]);

export const notificationType = pgEnum("notification_type", [
  "submission_received",
  "changes_requested",
  "approved",
]);

export const notificationChannel = pgEnum("notification_channel", [
  "email",
  "in_app",
]);
