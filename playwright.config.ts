import { defineConfig } from "@playwright/test";

// Parcours complets (phase 6) dans tests/e2e ; vérifications d'accessibilité dans tests/a11y.
export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e/**/*.spec.ts", "a11y/**/*.spec.ts"],
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "./node_modules/.bin/next dev",
    url: "http://localhost:3000/fr",
    reuseExistingServer: true,
  },
});
