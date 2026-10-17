import { timestamp, uuid } from "drizzle-orm/pg-core";

/** Clé primaire uuid générée par PostgreSQL (rien à deviner par énumération d'URL). */
export const id = () => uuid().defaultRandom().primaryKey();

/** Instant en UTC (`timestamptz`), rempli par la base à l'insertion. */
export const createdAt = () =>
  timestamp({ withTimezone: true }).notNull().defaultNow();

/**
 * `updated_at` : mis à jour par Drizzle à chaque UPDATE passé par l'application
 * (pas par un trigger : un UPDATE en SQL pur ne le changerait pas).
 */
export const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/** Instant facultatif (`_at` nullable). */
export const instant = () => timestamp({ withTimezone: true });
