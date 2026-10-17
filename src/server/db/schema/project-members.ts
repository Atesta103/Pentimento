import { foreignKey, index, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "./columns";
import { memberRole } from "./enums";
import { groups } from "./groups";
import { projects } from "./projects";
import { users } from "./users";

export const projectMembers = pgTable(
  "project_members",
  {
    id: id(),
    projectId: uuid().notNull(),
    userId: uuid().notNull(),
    groupId: uuid(),
    role: memberRole().notNull(),
    // Même mécanique que createdAt : instant d'entrée dans le projet.
    joinedAt: createdAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_project_members_project_id",
      columns: [t.projectId],
      foreignColumns: [projects.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_project_members_user_id",
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    // Clé composite : le groupe doit appartenir au MÊME projet que le membre.
    // group_id nul = pas encore de groupe : la clé composite n'est alors pas vérifiée.
    foreignKey({
      name: "fk_project_members_project_id_group_id",
      columns: [t.projectId, t.groupId],
      foreignColumns: [groups.projectId, groups.id],
    }).onDelete("restrict"),
    // Une personne n'est membre qu'une fois d'un projet (donc dans un seul groupe).
    unique("uq_project_members_project_id_user_id").on(t.projectId, t.userId),
    index("idx_project_members_user_id").on(t.userId),
    index("idx_project_members_group_id").on(t.groupId),
  ],
);
