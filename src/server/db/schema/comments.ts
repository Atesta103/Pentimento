import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, instant } from "./columns";
import { submissions } from "./submissions";
import { users } from "./users";

export const comments = pgTable(
  "comments",
  {
    id: id(),
    submissionId: uuid().notNull(),
    authorId: uuid().notNull(),
    body: text().notNull(),
    needsFix: boolean().notNull().default(false),
    // « Traité » = résolution datée et signée, plutôt qu'un booléen is_resolved.
    resolvedById: uuid(),
    resolvedAt: instant(),
    // Réservé V2 (annotation dans le document) ; vide au MVP.
    anchor: jsonb(),
    createdAt: createdAt(),
    editedAt: instant(),
  },
  (t) => [
    foreignKey({
      name: "fk_comments_submission_id",
      columns: [t.submissionId],
      foreignColumns: [submissions.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_comments_author_id",
      columns: [t.authorId],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "fk_comments_resolved_by_id",
      columns: [t.resolvedById],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    check(
      "ck_comments_resolution_both_or_none",
      sql`(${t.resolvedAt} is null) = (${t.resolvedById} is null)`,
    ),
    index("idx_comments_submission_id").on(t.submissionId),
  ],
);
