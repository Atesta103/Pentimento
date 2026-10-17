import { foreignKey, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "./columns";
import { projects } from "./projects";

export const groups = pgTable(
  "groups",
  {
    id: id(),
    projectId: uuid().notNull(),
    name: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_groups_project_id",
      columns: [t.projectId],
      foreignColumns: [projects.id],
    }).onDelete("restrict"),
    // Redondant avec la clé primaire, mais nécessaire : c'est la cible des clés
    // composites (project_id, group_id) de project_members et assignments.
    unique("uq_groups_project_id_id").on(t.projectId, t.id),
  ],
);
