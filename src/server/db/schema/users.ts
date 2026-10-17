import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, instant, updatedAt } from "./columns";
import { institutions } from "./institutions";

export const users = pgTable(
  "users",
  {
    id: id(),
    // Facultatif au MVP : pas d'administrateur ni d'établissement à créer (voir journal).
    institutionId: uuid(),
    email: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    locale: text().notNull().default("fr"),
    emailVerifiedAt: instant(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_users_institution_id",
      columns: [t.institutionId],
      foreignColumns: [institutions.id],
    }).onDelete("restrict"),
    unique("uq_users_email").on(t.email),
    // Unicité insensible à la casse : l'e-mail est stocké en minuscules, la base l'impose.
    check("ck_users_email_lowercase", sql`${t.email} = lower(${t.email})`),
    check("ck_users_locale", sql`${t.locale} in ('fr', 'en')`),
  ],
);
