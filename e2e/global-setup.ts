/**
 * Playwright Global Setup
 * 온보딩을 한 번 완료하고 localStorage 상태를 저장한다.
 * 이후 모든 visual.spec.ts 테스트는 이 상태로 시작한다.
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const STORAGE_STATE = path.join(__dirname, ".auth", "app-state.json");

export default async function globalSetup() {
  // 매 실행마다 신선한 상태 생성
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  console.log("\n[setup] 온보딩 완료 중...");
  await page.goto("http://localhost:3001");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // ─── Step 1: 기본 정보 ───────────────────────────────────────
  await page.waitForSelector("input#child-nickname", { timeout: 15000 });
  await page.fill("input#child-nickname", "지우");

  // 나이 선택 (만 5세)
  await page.click('button:has-text("만 5세")', { force: true });

  // 성별 선택 (여아)
  await page.click('button:has-text("여아")', { force: true });

  // 다음으로
  await page.click('button:has-text("다음 단계")', { force: true });

  // ─── Step 2: 기질 파악 ───────────────────────────────────────
  await page.waitForSelector("text=어떤 아이인가요", { timeout: 10000 });

  // Q1: 새로운 환경 (단일 선택)
  await page.click('button:has-text("낯선 곳도 씩씩하게")', { force: true });

  // 다음으로
  await page.click('button:has-text("다음 단계")', { force: true });

  // ─── Step 3: 검사 결과 건너뛰기 ─────────────────────────────
  await page.waitForSelector('button:has-text("검사 없이 시작하기")', { timeout: 10000 });
  await page.click('button:has-text("검사 없이 시작하기")', { force: true });

  // 메인 앱 로드 대기
  await page.waitForSelector("text=성장 트래커", { timeout: 15000 });
  console.log("[setup] 온보딩 완료 ✓");

  // storageState 저장
  await context.storageState({ path: STORAGE_STATE });
  console.log(`[setup] 상태 저장 → ${STORAGE_STATE}\n`);

  await browser.close();
}
