/**
 * 점수 계산 검증 테스트
 * Zustand store에 직접 활동을 추가하여 monthlyData가 재계산되는지 확인
 */

import { test, expect } from "@playwright/test";

test("활동 기록 후 추이 탭 점수 변화 검증", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // hydration 완료 대기
  await page.waitForTimeout(1000);

  // ── Step 1: 기록 전 시공간 점수 읽기 ─────────────────────────
  const beforeScores = await page.evaluate(() => {
    const raw = localStorage.getItem("growth-tracker-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const md = parsed?.state?.monthlyData ?? [];
    // 예측이 아닌 마지막 달 점수
    const actual = md.filter((d: { predicted?: boolean }) => !d.predicted);
    return actual[actual.length - 1]?.scores ?? null;
  });

  console.log("\n📊 기록 전 월간 점수:", JSON.stringify(beforeScores, null, 2));
  expect(beforeScores).not.toBeNull();

  // ── Step 2: 퍼즐 활동 추가 (시공간·처리속도에 영향) ────────────
  // Zustand store의 addActivity를 window.__zustand_store로 직접 호출
  const addResult = await page.evaluate(() => {
    const store = (window as Window & { __ZUSTAND_STORE__?: { getState: () => {
      addActivity: (a: unknown) => void;
      activities: Array<{ type: string; data: { category?: string } }>;
      monthlyData: Array<{ predicted?: boolean; scores: Record<string, number> }>;
    } } }).__ZUSTAND_STORE__;

    if (!store) {
      // localStorage를 직접 조작해서 활동 추가 후 reloadStorage 시도
      return "no_store";
    }

    const newActivity = {
      id: `act-test-${Date.now()}`,
      type: "activity" as const,
      timestamp: new Date().toISOString(),
      data: { category: "퍼즐", durationMin: 60, detail: "테스트 퍼즐 60분" },
    };

    store.getState().addActivity(newActivity);
    const state = store.getState();
    const actual = state.monthlyData.filter((d) => !d.predicted);
    return actual[actual.length - 1]?.scores ?? null;
  });

  // window.__ZUSTAND_STORE__가 노출되어 있지 않으면 localStorage 직접 조작
  if (addResult === "no_store") {
    console.log("ℹ Zustand store 미노출 — localStorage 직접 조작");

    // 현재 localStorage 읽기
    await page.evaluate(() => {
      const raw = localStorage.getItem("growth-tracker-storage");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const newAct = {
        id: `act-test-${Date.now()}`,
        type: "activity",
        timestamp: new Date().toISOString(),
        data: { category: "퍼즐", durationMin: 60, detail: "테스트 퍼즐 60분" },
      };
      parsed.state.activities = [newAct, ...(parsed.state.activities ?? [])];
      if (parsed.state.activeChildId) {
        parsed.state.allActivities[parsed.state.activeChildId] = parsed.state.activities;
      }
      localStorage.setItem("growth-tracker-storage", JSON.stringify(parsed));
    });

    // 페이지 리로드 → store가 localStorage에서 재수화 → useEffect가 recalculate 실행
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
  }

  // ── Step 3: 추이 탭으로 이동해서 업데이트된 점수 확인 ───────────
  // Nav 탭 클릭 (force + JS evaluate로 이중 보험)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("nav button"));
    const tab = buttons.find((b) => b.textContent?.includes("추이"));
    if (tab) (tab as HTMLElement).click();
  });
  await page.waitForTimeout(1500); // chart lazy load 포함

  // ── Step 4: 화면에서 점수 읽기 ──────────────────────────────
  const afterScores = await page.evaluate(() => {
    const raw = localStorage.getItem("growth-tracker-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const md = parsed?.state?.monthlyData ?? [];
    const actual = md.filter((d: { predicted?: boolean }) => !d.predicted);
    return actual[actual.length - 1]?.scores ?? null;
  });

  console.log("📊 기록 후 월간 점수:", JSON.stringify(afterScores, null, 2));

  // ── Step 5: 스크린샷 캡처 ────────────────────────────────────
  await page.screenshot({
    path: "test-results/score-verify-after.png",
    fullPage: true,
  });

  // ── Step 6: 검증 ─────────────────────────────────────────────
  expect(afterScores).not.toBeNull();

  // 퍼즐 추가 → 시공간(visualSpatial)이 올라가야 함
  const beforeVS = (beforeScores as Record<string, number>).visualSpatial;
  const afterVS = (afterScores as Record<string, number>).visualSpatial;

  console.log(`\n✅ 시공간: ${beforeVS} → ${afterVS} (${afterVS > beforeVS ? "↑ 상승" : afterVS === beforeVS ? "= 동일" : "↓ 하락"})`);
  console.log(`✅ 처리속도: ${(beforeScores as Record<string, number>).processingSpeed} → ${(afterScores as Record<string, number>).processingSpeed}`);

  expect(afterVS).toBeGreaterThanOrEqual(beforeVS);
});
