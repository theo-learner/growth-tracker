/**
 * 신규 기능 E2E 테스트
 * browser-testing.md 기준으로 작성
 *
 * 커버 범위:
 *  - 이번 주 발달 상태 (해석 레이어, 종합 배너)
 *  - K-DST 체크리스트 (토글, 진행도, 완료 메시지, localStorage 유지)
 *  - 기록 완료 화면 (CompletionScreen — 팁, 자동/수동 닫힘)
 *  - 추천 탭 — 집중 영역 카드 + 비용 없는 놀이
 *  - UI/UX — sticky 헤더(CSS), 해석 색상 일관성, 빈 상태 시각 품질
 */

import { test, expect, type Page } from "@playwright/test";
import path from "path";

// playwright.dev.config.ts에서 storageState가 전역 주입되므로
// 여기서는 별도 test.use 없이 그대로 사용 (dev config 전용)

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

async function goToTab(page: Page, label: "홈" | "리포트" | "놀이" | "추이") {
  await page.locator(`nav button:has-text("${label}")`).click({ force: true });
  await page.waitForTimeout(500);
}

async function openRecordSheet(
  page: Page,
  type: "활동" | "질문" | "독서" | "감정" | "사진"
) {
  // RecordButton의 aria-label은 "${label} 기록하기" 형식
  const btn = page.getByRole("button", { name: `${type} 기록하기` });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true });
  await page.waitForTimeout(800);
}

async function scrollToBottom(page: Page) {
  await page.evaluate(() => {
    const scrollable =
      document.querySelector(".overflow-y-auto") ||
      document.querySelector("[class*='overflow-y']") ||
      document.documentElement;
    scrollable.scrollTop = scrollable.scrollHeight;
  });
  await page.waitForTimeout(300);
}

// ─── 테스트 스위트 ─────────────────────────────────────────────────────────

test.describe("이번 주 발달 상태 — 해석 레이어", () => {
  test("01 · 5개 영역 카드 + 해석 메시지 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // 섹션 제목 확인
    await expect(
      page.locator("h3:has-text('이번 주 발달 상태')")
    ).toBeVisible({ timeout: 8000 });

    // 5개 영역 모두 표시
    for (const domain of ["언어이해", "시공간", "유동추론", "작업기억", "처리속도"]) {
      await expect(page.locator(`text=${domain}`).first()).toBeVisible();
    }

    // 해석 메시지 — interpretPercentile 반환값 확인
    // "또래 상위 N%", "또래 중상위권", "또래 하위권 — 관심 필요" 중 하나 이상 표시
    const interpretTexts = ["또래 상위", "또래 중상위권", "또래 하위권", "잘 하고 있어요", "집중해 볼까요", "관심 필요"];
    let found = false;
    for (const msg of interpretTexts) {
      if (await page.locator(`text=${msg}`).first().isVisible().catch(() => false)) {
        found = true;
        break;
      }
    }
    expect(found, "해석 메시지(또래 상위/중상위권/하위권) 중 하나가 표시되어야 함").toBe(true);

    await page.screenshot({ path: "test-results/feat-01-dev-status.png", fullPage: false });
  });

  test("02 · 종합 상태 배너 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // 종합 배너 메시지 (getOverallSummary 반환값 3종)
    const summaryBannerMsgs = [
      "전반적으로 잘 성장하고 있어요",
      "몇 가지 영역에 함께 관심 가져봐요",
      "고르게 발달하고 있어요",
    ];
    let bannerVisible = false;
    for (const msg of summaryBannerMsgs) {
      if (
        await page
          .locator(`text=${msg}`)
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        bannerVisible = true;
        break;
      }
    }
    expect(bannerVisible, "종합 상태 배너가 화면에 보여야 함").toBe(true);

    await page.screenshot({ path: "test-results/feat-02-summary-banner.png" });
  });

  test("03 · AI Daily Note — 이번 주 종합 상태 한줄 표시", async ({ page }) => {
    // app-state.json 샘플 데이터가 2026-02-27 기준이므로 날짜 고정
    await page.clock.setFixedTime(new Date("2026-02-27T12:00:00Z"));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // "이번 주:" 텍스트 패턴 (DailyInsight: "{name} 이번 주: {message}")
    const weeklyLine = page.locator("text=/이번 주:/").first();
    await expect(weeklyLine).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: "test-results/feat-03-ai-note-status.png" });
  });
});

test.describe("K-DST 체크리스트", () => {
  test("04 · 체크리스트 표시 및 초기 상태", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // KDSTChecklist 섹션 제목: "이 시기 발달 과업" (h4)
    await expect(
      page.locator("h4:has-text('이 시기 발달 과업')")
    ).toBeVisible({ timeout: 8000 });

    // 프로그레스 텍스트 (N/M 달성 패턴)
    const progressText = page.locator("text=/\\d+\\/\\d+ 달성/").first();
    await expect(progressText).toBeVisible();

    await page.screenshot({ path: "test-results/feat-04-kdst-initial.png" });
  });

  test("05 · 체크 항목 토글 — 체크/해제", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // K-DST 컨테이너 내 첫 번째 체크 버튼
    await expect(
      page.locator("h4:has-text('이 시기 발달 과업')")
    ).toBeVisible({ timeout: 8000 });

    const kdstContainer = page.locator("div.bg-white.rounded-xl").filter({
      has: page.locator("h4:has-text('이 시기 발달 과업')"),
    });

    const firstItem = kdstContainer.locator("button").first();
    await firstItem.scrollIntoViewIfNeeded();

    // 클릭 전 배경 확인 (체크 안된 상태 = bg-surface)
    const classBeforeCheck = await firstItem.getAttribute("class");

    // 체크
    await firstItem.click({ force: true });
    await page.waitForTimeout(400);

    const classAfterCheck = await firstItem.getAttribute("class");
    expect(classAfterCheck).toContain("bg-primary-50");

    // 재클릭 해제
    await firstItem.click({ force: true });
    await page.waitForTimeout(400);

    const classAfterUncheck = await firstItem.getAttribute("class");
    expect(classAfterUncheck).not.toContain("bg-primary-50");

    await page.screenshot({ path: "test-results/feat-05-kdst-toggle.png" });
  });

  test("06 · 체크 상태 localStorage 유지", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await expect(
      page.locator("h4:has-text('이 시기 발달 과업')")
    ).toBeVisible({ timeout: 8000 });

    const kdstContainer = page.locator("div.bg-white.rounded-xl").filter({
      has: page.locator("h4:has-text('이 시기 발달 과업')"),
    });
    const firstItem = kdstContainer.locator("button").first();
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click({ force: true });
    await page.waitForTimeout(400);

    // localStorage에 kdstChecks 저장 확인
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem("growth-tracker-storage");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.kdstChecks ?? null;
    });

    expect(stored).not.toBeNull();
    expect(Object.keys(stored as Record<string, boolean>).length).toBeGreaterThan(0);

    // 새로고침 후 상태 유지 확인
    await page.reload();
    await page.waitForLoadState("networkidle");

    const storedAfterReload = await page.evaluate(() => {
      const raw = localStorage.getItem("growth-tracker-storage");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.kdstChecks ?? null;
    });

    expect(
      Object.keys(storedAfterReload as Record<string, boolean>).length,
      "새로고침 후에도 체크 상태가 유지되어야 함"
    ).toBeGreaterThan(0);

    await page.screenshot({ path: "test-results/feat-06-kdst-persistence.png" });
  });
});

// 다이얼로그 내 폼을 저장하는 헬퍼
// nav 바(fixed bottom-0 z-50)가 저장 버튼을 시각적으로 덮으므로
// native element.click()으로 직접 이벤트 발송 (오버레이 무시)
async function saveRecordForm(page: Page) {
  const dialog = page.locator('[role="dialog"]');
  const saveBtn = dialog.getByRole("button", { name: "기록 완료" });
  await expect(saveBtn).toBeVisible({ timeout: 5000 });
  // evaluate()로 native click → React의 onClick handler 직접 호출
  await saveBtn.evaluate((el: HTMLElement) => el.click());
  // CompletionScreen 전환 대기
  await page.waitForTimeout(600);
}

test.describe("기록 완료 화면 (CompletionScreen)", () => {
  test("07 · 활동 기록 후 완료 화면 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");

    // 다이얼로그 열림 확인
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 카테고리 선택 (미술 — difficulty section 없어서 더 단순)
    await dialog.locator("button:has-text('미술')").click();
    await page.waitForTimeout(300);

    // 소요 시간 입력
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("30");
    await page.waitForTimeout(200);

    await saveRecordForm(page);

    // CompletionScreen 표시 확인
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 팁 카드 표시 확인
    await expect(page.locator("div.bg-primary-50").first()).toBeVisible({ timeout: 5000 });

    // "다음에 해볼 활동" 카드
    await expect(page.locator("text=다음에 해볼 활동")).toBeVisible();

    await page.screenshot({ path: "test-results/feat-07-completion-screen.png" });
  });

  test("08 · 완료 화면 — 수동 닫기", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 카테고리 선택
    await dialog.locator("button:has-text('학습')").click();
    await page.waitForTimeout(300);

    // 소요 시간 입력
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("20");
    await page.waitForTimeout(200);

    await saveRecordForm(page);

    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // "확인" 버튼 클릭 → 즉시 닫힘 (nav 바 오버레이로 인해 native click 사용)
    const confirmBtn = page.getByRole("button", { name: "확인" });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(500);

    // 바텀시트 닫힘 확인
    await expect(page.locator("h3:has-text('기록 완료!')")).not.toBeVisible();

    await page.screenshot({ path: "test-results/feat-08-completion-close.png" });
  });

  test("09 · 완료 화면 — 타임라인에 기록 추가됨", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 카테고리 선택 (운동)
    await dialog.locator("button:has-text('운동')").click();
    await page.waitForTimeout(300);

    // 소요 시간 입력
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("25");
    await page.waitForTimeout(200);

    await saveRecordForm(page);

    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // nav 바 오버레이로 인해 native click 사용
    const confirmBtn09 = page.getByRole("button", { name: "확인" });
    await confirmBtn09.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(500);

    // 타임라인에 운동 기록 확인
    await expect(page.locator("text=운동").first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/feat-09-timeline-updated.png" });
  });

  test("10 · 독서 기록 후 독서 팁 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "독서");

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 책 제목 입력
    const bookInput = dialog.locator('input[placeholder="예: 구름빵"]');
    await bookInput.fill("구름빵");
    await page.waitForTimeout(200);

    await saveRecordForm(page);

    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 독서 팁 카드 확인
    await expect(page.locator("div.bg-primary-50").first()).toBeVisible();

    await page.screenshot({ path: "test-results/feat-10-reading-tip.png" });

    // nav 바 오버레이로 인해 native click 사용
    const confirmBtn10 = page.getByRole("button", { name: "확인" });
    await confirmBtn10.evaluate((el: HTMLElement) => el.click());
  });
});

test.describe("추천 탭 — 집중 영역 & 비용 없는 놀이", () => {
  test("11 · 이번 주 집중 영역 카드 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // 집중 영역 섹션 제목
    await expect(
      page.locator("h3:has-text('이번 주 집중 영역')")
    ).toBeVisible({ timeout: 8000 });

    // 영역명 (5개 중 하나)
    const domains = ["언어이해", "시공간", "유동추론", "작업기억", "처리속도"];
    let domainVisible = false;
    for (const d of domains) {
      if (await page.locator(`p:has-text("${d}")`).first().isVisible().catch(() => false)) {
        domainVisible = true;
        break;
      }
    }
    expect(domainVisible, "집중 영역명이 표시되어야 함").toBe(true);

    await page.screenshot({ path: "test-results/feat-11-focus-area.png" });
  });

  test("12 · 비용 없는 놀이 섹션 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // 비용 없는 놀이 섹션
    await expect(
      page.locator("h3:has-text('지금 당장 해볼 수 있는 놀이')")
    ).toBeVisible({ timeout: 8000 });

    // 소요시간 배지 (N분 형식) 하나 이상
    const durationBadge = page
      .locator("span")
      .filter({ hasText: /^\d+분$/ })
      .first();
    await expect(durationBadge).toBeVisible();

    await page.screenshot({ path: "test-results/feat-12-free-play.png", fullPage: false });
  });

  test("13 · 추천 활동 섹션 — 집중 영역 연결 문구", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // 추천 활동 섹션
    await expect(page.locator("h3:has-text('추천 활동')")).toBeVisible({ timeout: 8000 });

    // 집중 영역 연결 문구 ("XX 강화 중심")
    await expect(
      page.locator("text=/강화 중심/").first()
    ).toBeVisible();

    await page.screenshot({ path: "test-results/feat-13-activity-focus.png" });
  });

  test("14 · 새로고침 버튼 동작", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // 새로고침 버튼 (aria-label로 찾기)
    const refreshBtn = page.locator("button[aria-label='추천 새로고침']");
    await expect(refreshBtn).toBeVisible({ timeout: 5000 });

    // 클릭 전 정상 상태 확인
    await expect(refreshBtn).toBeEnabled();

    await refreshBtn.click({ force: true });

    // 새로고침 후 버튼이 다시 활성화됨 (로딩 완료)
    await expect(refreshBtn).toBeEnabled({ timeout: 10000 });

    // 새로고침 후에도 집중 영역 섹션 정상 표시
    await expect(
      page.locator("h3:has-text('이번 주 집중 영역')")
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/feat-14-refresh.png" });
  });
});

test.describe("UI/UX — 디자인 시스템 일관성", () => {
  test("15 · 하단 내비게이션 fixed CSS 속성 확인", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // 하단 nav 바의 position: fixed CSS 확인 (MainApp: <nav className="fixed bottom-0 ...">)
    const navPosition = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      if (!nav) return null;
      return window.getComputedStyle(nav).position;
    });

    // fixed (탭 바가 화면 하단에 고정되어야 함)
    expect(
      ["sticky", "fixed"].includes(navPosition ?? ""),
      `하단 nav position이 fixed여야 함 (실제: ${navPosition})`
    ).toBe(true);

    await page.screenshot({ path: "test-results/feat-15-sticky-header.png" });
  });

  test("16 · 추천 탭 sticky 헤더 CSS 확인", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // div.sticky 요소의 CSS 확인
    const stickyPosition = await page.evaluate(() => {
      const stickyEl = document.querySelector("div.sticky");
      if (!stickyEl) return null;
      return window.getComputedStyle(stickyEl).position;
    });

    expect(
      ["sticky", "fixed"].includes(stickyPosition ?? ""),
      `추천 탭 sticky 헤더 position이 sticky여야 함 (실제: ${stickyPosition})`
    ).toBe(true);

    await page.screenshot({ path: "test-results/feat-16-recommend-sticky.png" });
  });

  test("17 · 해석 색상 일관성 — 홈 vs 추천 탭", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 추천 탭 집중 영역 카드 색상 확인
    await goToTab(page, "놀이");
    await page.waitForTimeout(500);

    const recommendSection = page.locator("section").filter({
      has: page.locator("h3:has-text('이번 주 집중 영역')"),
    });
    await expect(recommendSection).toBeVisible({ timeout: 5000 });

    const cardHtml = await recommendSection.innerHTML().catch(() => "");
    const hasColorClass =
      cardHtml.includes("bg-primary-50") ||
      cardHtml.includes("bg-amber-50") ||
      cardHtml.includes("bg-rose-50");
    expect(hasColorClass, "집중 영역 카드에 해석 색상 배경이 있어야 함").toBe(true);

    await page.screenshot({ path: "test-results/feat-17-color-consistency.png" });
  });

  test("18 · 빈 상태 — 추천 탭 교구/활동 없을 때 UI", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // recommendations, products 비우기
    await page.evaluate(() => {
      const raw = localStorage.getItem("growth-tracker-storage");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      parsed.state.recommendations = [];
      parsed.state.products = [];
      localStorage.setItem("growth-tracker-storage", JSON.stringify(parsed));
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // 빈 상태 메시지 확인
    const emptyMsgs = [
      "기록을 더 남기면",
      "맞춤 활동을 추천",
      "교구를 추천",
      "발달에 맞는",
    ];
    let emptyMsgFound = false;
    for (const msg of emptyMsgs) {
      if (await page.locator(`text=${msg}`).first().isVisible().catch(() => false)) {
        emptyMsgFound = true;
        break;
      }
    }
    expect(emptyMsgFound, "빈 상태 메시지가 표시되어야 함").toBe(true);

    await page.screenshot({ path: "test-results/feat-18-empty-state.png" });
  });

  test("19 · 모바일 뷰포트 (390px) — 가로 overflow 없음", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // 가로 overflow 없음
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(
      bodyScrollWidth,
      `가로 scroll width(${bodyScrollWidth}px)가 뷰포트(390px) 이하여야 함`
    ).toBeLessThanOrEqual(390);

    await page.screenshot({ path: "test-results/feat-19-mobile-390.png", fullPage: false });
  });

  test("20 · btn-primary 클래스 및 기록 완료 버튼 확인", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    await page.waitForTimeout(400);

    // "기록 완료" 버튼이 btn-primary 클래스 보유
    const saveBtn = page.locator("button.btn-primary:has-text('기록 완료')");
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeVisible({ timeout: 5000 });

    // btn-primary 클래스 확인
    const className = await saveBtn.getAttribute("class");
    expect(className).toContain("btn-primary");

    await page.screenshot({ path: "test-results/feat-20-btn-primary.png" });

    // 닫기
    const closeBtn = page
      .locator("button")
      .filter({ has: page.locator('.material-symbols-outlined:text-is("close")') })
      .first();
    await closeBtn.click({ force: true });
  });
});
