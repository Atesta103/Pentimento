/**
 * Charge le jeu de données de démonstration dans la base LOCALE (efface d'abord ses données).
 * Usage : pnpm db:seed   (la base doit tourner : ./scripts/dev.sh)
 */
import { createDb } from "../src/server/db/client";
import { resetAllData, seedDatabase } from "../src/server/db/seed";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL est absente : lance ./scripts/dev.sh (il crée .env.local).",
  );
  process.exit(1);
}

// Garde-fou : le seed efface tout. Il ne tourne que sur une base de cette machine.
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1", "db"].includes(host)) {
  console.error(
    `Refus : la base « ${host} » n'est pas locale. Le seed efface toutes les données.`,
  );
  process.exit(1);
}

const { db, pool } = createDb(url);
try {
  await resetAllData(db);
  await seedDatabase(db);
  console.log("✔ Données de démonstration chargées.");
} finally {
  await pool.end();
}
