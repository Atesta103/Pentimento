import { pgTable, text, unique } from "drizzle-orm/pg-core";
import { createdAt, id } from "./columns";

export const institutions = pgTable(
  "institutions",
  {
    id: id(),
    name: text().notNull(),
    slug: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [unique("uq_institutions_slug").on(t.slug)],
);
