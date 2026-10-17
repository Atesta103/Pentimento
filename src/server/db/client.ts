import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/** Client Drizzle : les noms TypeScript en camelCase deviennent du snake_case en base. */
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema, casing: "snake_case" });
  return { db, pool };
}

export type Database = ReturnType<typeof createDb>["db"];

// Next.js recharge les modules en développement : on garde UN pool, sinon chaque
// rechargement en ouvrirait un nouveau et la base finirait par refuser les connexions.
const globalForDb = globalThis as unknown as {
  pentimentoDb?: ReturnType<typeof createDb>;
};

export function getDb(): Database {
  if (!globalForDb.pentimentoDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL est absente : lance ./scripts/dev.sh (il crée .env.local).",
      );
    }
    globalForDb.pentimentoDb = createDb(url);
  }
  return globalForDb.pentimentoDb.db;
}
