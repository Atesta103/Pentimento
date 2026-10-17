import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, instant } from "./columns";
import { notificationChannel, notificationType } from "./enums";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: uuid().notNull(),
    type: notificationType().notNull(),
    channel: notificationChannel().notNull(),
    payload: jsonb().notNull(),
    attemptCount: integer().notNull().default(0),
    createdAt: createdAt(),
    sentAt: instant(),
    readAt: instant(),
  },
  (t) => [
    foreignKey({
      name: "fk_notifications_user_id",
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete("restrict"),
    check(
      "ck_notifications_attempt_count_non_negative",
      sql`${t.attemptCount} >= 0`,
    ),
    index("idx_notifications_user_id_sent_at").on(t.userId, t.sentAt),
  ],
);
