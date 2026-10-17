import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { assignments } from "./assignments";
import { id } from "./columns";
import { users } from "./users";

/**
 * Une version déposée. IMMUABLE : jamais d'UPDATE ni de DELETE (trigger en
 * migration), donc pas de updated_at.
 */
export const submissions = pgTable(
  "submissions",
  {
    id: id(),
    assignmentId: uuid().notNull(),
    submittedById: uuid().notNull(),
    versionNumber: integer().notNull(),
    note: text(),
    storageKey: text().notNull(),
    originalFilename: text().notNull(),
    mimeType: text().notNull(),
    sizeBytes: integer().notNull(),
    checksumSha256: text().notNull(),
    submittedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "fk_submissions_assignment_id",
      columns: [t.assignmentId],
      foreignColumns: [assignments.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_submissions_submitted_by_id",
      columns: [t.submittedById],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    // Pas de deux « v2 » pour un même livrable de groupe.
    unique("uq_submissions_assignment_id_version_number").on(
      t.assignmentId,
      t.versionNumber,
    ),
    check(
      "ck_submissions_version_number_positive",
      sql`${t.versionNumber} >= 1`,
    ),
    check("ck_submissions_size_bytes_positive", sql`${t.sizeBytes} > 0`),
    check(
      "ck_submissions_checksum_sha256_format",
      sql`${t.checksumSha256} ~ '^[0-9a-f]{64}$'`,
    ),
    // Pas d'index « version_number desc » en plus : l'unicité ci-dessus crée déjà un index
    // (assignment_id, version_number) que PostgreSQL parcourt à l'envers pour la dernière version.
  ],
);
