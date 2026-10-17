import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests contre une VRAIE base PostgreSQL (docs/architecture/architecture.md, « Stratégie de tests »).
// Les règles importantes vivent aussi dans la base : un simulacre ne prouverait rien sur elles.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["tests/integration/global-setup.ts"],
    // Une seule base de test partagée : les fichiers passent l'un après l'autre.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
