import { defineConfig } from "@playwright/test";
import path from "path";

/**
 * features.spec.ts 전용 Playwright 설정
 * - 기존 app-state.json 재사용 (global-setup 없음)
 * - headless: true (빠른 CI-스타일 실행)
 * - port 3000 (dev server)
 */
const STORAGE_STATE = path.join(__dirname, "e2e", ".auth", "app-state.json");

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/features.spec.ts", "**/features-v2.spec.ts"],
  timeout: 60000,
  retries: 1,

  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "on",
    viewport: { width: 390, height: 844 },
    storageState: STORAGE_STATE,
  },

  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: { args: ["--no-sandbox"] },
      },
    },
  ],
});
