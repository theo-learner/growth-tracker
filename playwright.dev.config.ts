import { defineConfig } from "@playwright/test";
import path from "path";

/**
 * 시각적 확인용 Playwright 설정
 * - headless: false → 브라우저가 직접 열림
 * - slowMo: 600ms → 각 동작을 눈으로 확인 가능
 * - viewport: iPhone 14 Pro 크기 (390×844)
 *
 * 실행 방법:
 *   npm run dev  (다른 터미널에서 먼저 실행)
 *   npm run test:visual
 */

export const STORAGE_STATE = path.join(__dirname, "e2e", ".auth", "app-state.json");

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/visual.spec.ts"],
  timeout: 90000,
  retries: 0,

  // 온보딩을 한 번 완료하고 storageState 저장
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: "http://localhost:3000",
    headless: false,
    screenshot: "on",
    video: "retain-on-failure",
    viewport: { width: 390, height: 844 },
    // 온보딩이 완료된 상태로 각 테스트 시작
    storageState: STORAGE_STATE,
  },

  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: {
          args: ["--no-sandbox"],
          slowMo: 600,
        },
      },
    },
  ],
});
