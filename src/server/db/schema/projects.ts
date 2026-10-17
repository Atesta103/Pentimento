import { sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, instant, updatedAt } from "./columns";
import { projectStatus } from "./enums";
import { institutions } from "./institutions";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: id(),
    institutionId: uuid(),
    createdById: uuid().notNull(),
    title: text().notNull(),
    brief: text().notNull(),
    objectives: text(),
    // `_on` = un jour (date), sans heure ni fuseau.
    startsOn: date({ mode: "string" }).notNull(),
    endsOn: date({ mode: "string" }).notNull(),
    status: projectStatus().notNull().default("draft"),
    inviteCode: text().notNull(),
    inviteExpiresAt: instant(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_projects_institution_id",
      columns: [t.institutionId],
      foreignColumns: [institutions.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_projects_created_by_id",
      columns: [t.createdById],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    unique("uq_projects_invite_code").on(t.inviteCode),
    check(
      "ck_projects_ends_on_after_starts_on",
      sql`${t.endsOn} >= ${t.startsOn}`,
    ),
  ],
);
