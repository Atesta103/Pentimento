import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { assignments } from "./assignments";
import { id } from "./columns";
import { assignmentStatus } from "./enums";
import { submissions } from "./submissions";
import { users } from "./users";

/**
 * Journal des changements de statut. IMMUABLE : jamais d'UPDATE ni de DELETE
 * (trigger en migration). Écrit dans la même transaction que assignments.status.
 */
export const statusChanges = pgTable(
  "status_changes",
  {
    id: id(),
    assignmentId: uuid().notNull(),
    submissionId: uuid(),
    changedById: uuid().notNull(),
    fromStatus: assignmentStatus().notNull(),
    toStatus: assignmentStatus().notNull(),
    note: text(),
    changedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "fk_status_changes_assignment_id",
      columns: [t.assignmentId],
      foreignColumns: [assignments.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_status_changes_submission_id",
      columns: [t.submissionId],
      foreignColumns: [submissions.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_status_changes_changed_by_id",
      columns: [t.changedById],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    check(
      "ck_status_changes_from_differs_to",
      sql`${t.fromStatus} <> ${t.toStatus}`,
    ),
    index("idx_status_changes_assignment_id_changed_at").on(
      t.assignmentId,
      t.changedAt,
    ),
  ],
);
