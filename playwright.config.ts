import { defineConfig } from "@playwright/test";

// Configuration seule : aucun scénario avant la phase 6 (tranche verticale).
export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
