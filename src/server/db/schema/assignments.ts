import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, instant, updatedAt } from "./columns";
import { assignmentStatus } from "./enums";
import { deliverables } from "./deliverables";
import { groups } from "./groups";
import { users } from "./users";

/** Un livrable assigné à un groupe : c'est ici que vit le statut courant. */
export const assignments = pgTable(
  "assignments",
  {
    id: id(),
    // Redondant (déductible du livrable) : il sert aux clés composites ci-dessous,
    // qui obligent la base à refuser un groupe et un livrable de projets différents.
    projectId: uuid().notNull(),
    deliverableId: uuid().notNull(),
    groupId: uuid().notNull(),
    status: assignmentStatus().notNull().default("to_submit"),
    lastActivityAt: instant().notNull().defaultNow(),
    approvedById: uuid(),
    approvedAt: instant(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_assignments_project_id_deliverable_id",
      columns: [t.projectId, t.deliverableId],
      foreignColumns: [deliverables.projectId, deliverables.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_assignments_project_id_group_id",
      columns: [t.projectId, t.groupId],
      foreignColumns: [groups.projectId, groups.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_assignments_approved_by_id",
      columns: [t.approvedById],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    unique("uq_assignments_deliverable_id_group_id").on(
      t.deliverableId,
      t.groupId,
    ),
    check(
      "ck_assignments_approval_both_or_none",
      sql`(${t.approvedAt} is null) = (${t.approvedById} is null)`,
    ),
    check(
      "ck_assignments_approval_only_when_approved",
      sql`${t.approvedAt} is null or ${t.status} = 'approved'`,
    ),
    index("idx_assignments_group_id_status").on(t.groupId, t.status),
    index("idx_assignments_status_last_activity_at").on(
      t.status,
      t.lastActivityAt,
    ),
    // Compteurs du dashboard enseignant : les affectations d'un projet par statut.
    index("idx_assignments_project_id_status").on(t.projectId, t.status),
  ],
);
