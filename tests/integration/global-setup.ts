import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";
import {
  TEST_DATABASE_NAME,
  databaseUrl,
  testDatabaseUrl,
} from "./helpers/test-database";

/**
 * Avant tous les tests : recrée la base de test de zéro puis applique TOUTES les
 * migrations. Si une migration est cassée, rien ne démarre (« une base vide migre sans erreur »).
 */
export default async function setup() {
  const admin = new Client({ connectionString: databaseUrl("postgres") });
  try {
    await admin.connect();
  } catch (error) {
    throw new Error(
      "La base PostgreSQL ne répond pas. Lance ./scripts/dev.sh (elle démarre avec l'application).",
      { cause: error },
    );
  }

  try {
    await admin.query(
      `DROP DATABASE IF EXISTS ${TEST_DATABASE_NAME} WITH (FORCE)`,
    );
    await admin.query(`CREATE DATABASE ${TEST_DATABASE_NAME}`);
  } finally {
    await admin.end();
  }

  const pool = new Pool({ connectionString: testDatabaseUrl() });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: "src/server/db/migrations",
    });
  } finally {
    await pool.end();
  }
}
