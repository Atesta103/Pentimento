import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./columns";
import { projects } from "./projects";
import { templates } from "./templates";

export const deliverables = pgTable(
  "deliverables",
  {
    id: id(),
    projectId: uuid().notNull(),
    templateId: uuid(),
    title: text().notNull(),
    instructions: text().notNull(),
    dueAt: timestamp({ withTimezone: true }).notNull(),
    sortOrder: integer().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_deliverables_project_id",
      columns: [t.projectId],
      foreignColumns: [projects.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_deliverables_template_id",
      columns: [t.templateId],
      foreignColumns: [templates.id],
    }).onDelete("restrict"),
    // Cible de la clé composite (project_id, deliverable_id) de assignments.
    unique("uq_deliverables_project_id_id").on(t.projectId, t.id),
    index("idx_deliverables_project_id_sort_order").on(
      t.projectId,
      t.sortOrder,
    ),
  ],
);
