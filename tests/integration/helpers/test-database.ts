import type { Pool } from "pg";

export const TEST_DATABASE_NAME = "pentimento_test";

/** Même serveur que DATABASE_URL, autre base. Refuse tout ce qui ne finit pas par `_test`. */
export function databaseUrl(database: string): string {
  const base = process.env.DATABASE_URL;
  if (!base) {
    throw new Error(
      "DATABASE_URL est absente. Lance ./scripts/dev.sh (il crée .env.local), puis relance les tests.",
    );
  }
  const url = new URL(base);
  url.pathname = `/${database}`;
  return url.toString();
}

export function testDatabaseUrl(): string {
  if (!TEST_DATABASE_NAME.endsWith("_test")) {
    throw new Error("Garde-fou : la base de test doit finir par _test");
  }
  return databaseUrl(TEST_DATABASE_NAME);
}

export async function closePool(pool: Pool): Promise<void> {
  await pool.end();
}
