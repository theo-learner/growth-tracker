/**
 * 시각적 E2E 테스트 — Stitch 디자인 검증
 *
 * 실행 방법:
 *   npm run dev            (별도 터미널)
 *   npm run test:visual    (이 파일 실행)
 *
 * 각 테스트는 브라우저를 직접 열어 화면을 보여주며 진행된다.
 * 스크린샷은 test-results/ 디렉토리에 저장된다.
 */

import { test, expect, type Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────────────────────────

/** 하단 탭 이동 헬퍼 — Next.js dev portal 우회를 위해 force 사용 */
async function goToTab(page: Page, label: "홈" | "리포트" | "놀이" | "추이") {
  await page.locator(`nav button:has-text("${label}")`).click({ force: true });
  await page.waitForTimeout(600);
}

/** 바텀 시트 닫기 — close 버튼 사용 */
async function closeBottomSheet(page: Page) {
  // close 아이콘 텍스트로 닫기 버튼 찾기
  const closeBtn = page
    .locator("button")
    .filter({ has: page.locator('.material-symbols-outlined:text-is("close")') })
    .first();
  await closeBtn.click({ force: true });
  await page.waitForTimeout(400);
}

// ─────────────────────────────────────────────────────────────
// 테스트 스위트
// ─────────────────────────────────────────────────────────────

test.describe("Stitch 디자인 시각적 검증", () => {

  // ── 1. 앱 초기 로드 & 헤더 ──────────────────────────────────
  test("01 · 헤더 및 탭 바 구조", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 헤더: "성장 트래커" 텍스트
    await expect(page.locator("header")).toContainText("성장 트래커");

    // 가이드/설정 버튼
    await expect(page.getByRole("button", { name: "가이드" })).toBeVisible();
    await expect(page.getByRole("button", { name: "설정" })).toBeVisible();

    // 하단 탭 4개
    for (const label of ["홈", "리포트", "놀이", "추이"]) {
      await expect(page.locator(`nav button:has-text("${label}")`)).toBeVisible();
    }

    // 홈 탭 활성 상태 — primary 색상 클래스
    await expect(page.locator('nav button:has-text("홈")')).toHaveClass(/text-primary/);

    await page.screenshot({ path: "test-results/01-header.png", fullPage: false });
  });

  // ── 2. 홈 탭 — 프로필 & Growth at a Glance ─────────────────
  test("02 · 홈 탭 — 아바타, 발달 카드, Quick Logs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // 아이 이름 표시 (h2 중 첫 번째)
    await expect(page.locator("h2").first()).toContainText("지우");

    // D+N 뱃지 — /D\+\d+/ 패턴
    await expect(
      page.locator("span").filter({ hasText: /D\+\d+/ }).first()
    ).toBeVisible();

    // "Growth at a Glance" 섹션
    await expect(page.locator("h3:has-text('Growth at a Glance')")).toBeVisible();

    // 상위 2개 도메인 카드 (2열 그리드)
    const domainCards = page.locator(".grid.grid-cols-2 > div");
    expect(await domainCards.count()).toBeGreaterThanOrEqual(2);

    // Quick Logs 섹션
    await expect(page.locator("h3:has-text('Quick Logs')")).toBeVisible();

    // 5개 Quick Log 버튼
    for (const label of ["사진", "활동", "질문", "독서", "감정"]) {
      await expect(
        page.getByRole("button", { name: `${label} 기록하기` })
      ).toBeVisible();
    }

    await page.screenshot({ path: "test-results/02-home.png", fullPage: true });
  });

  // ── 3. 기록 시트 열기 & 닫기 ──────────────────────────────
  test("03 · 기록 시트 — 활동 기록", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // "활동 기록하기" Quick Log 버튼 클릭 (스크롤 후 JS click으로 Next.js portal 우회)
    const activityBtn = page.getByRole("button", { name: "활동 기록하기" });
    await activityBtn.scrollIntoViewIfNeeded();
    await activityBtn.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(800);

    // 바텀시트 열림 확인
    await expect(page.locator(".bottom-sheet-backdrop")).toBeVisible();

    // 카테고리 버튼들 확인
    await expect(page.locator("button:has-text('퍼즐')")).toBeVisible();
    await expect(page.locator("button:has-text('블록')")).toBeVisible();

    // 카테고리 선택 → primary 스타일 확인
    await page.locator("button:has-text('퍼즐')").click({ force: true });
    await expect(
      page.locator("button:has-text('퍼즐')")
    ).toHaveClass(/bg-primary/);

    await page.screenshot({ path: "test-results/03-record-sheet.png", fullPage: false });

    // 닫기
    await closeBottomSheet(page);
    await expect(page.locator(".bottom-sheet-backdrop")).not.toBeVisible();
  });

  // ── 4. 리포트 탭 ──────────────────────────────────────────
  test("04 · 리포트 탭 — 레이더 차트 & 발달 구간", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "리포트");

    // 탭 헤더
    await expect(page.locator("h2:has-text('성장 리포트')")).toBeVisible();

    // 레이더 차트 SVG 렌더링 (lazy load 대기)
    await page.waitForTimeout(1500);
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();

    // 영역별 발달 분석 섹션
    await expect(page.locator("h3:has-text('영역별 발달 분석')")).toBeVisible();

    // 발달 구간 섹션
    await expect(page.locator("h3:has-text('발달 구간')")).toBeVisible();

    // 트렌드 아이콘 (trending_up / trending_flat / trending_down) 존재
    await expect(
      page.locator('.material-symbols-outlined').filter({ hasText: /trending/ }).first()
    ).toBeVisible();

    await page.screenshot({ path: "test-results/04-report.png", fullPage: true });
  });

  // ── 5. 놀이 탭 — Stitch Screen 2 패턴 ───────────────────────
  test("05 · 놀이 탭 — 인사 헤더 & 활동 카드", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "놀이");

    // 탭 콘텐츠 로드 대기
    await page.waitForSelector("h2", { timeout: 10000 });

    // 맞춤 추천 헤더
    await expect(page.locator("h2").filter({ hasText: "맞춤 추천" })).toBeVisible();

    // 새로고침 버튼
    await expect(page.getByRole("button", { name: "새로고침" })).toBeVisible();

    // 추천 활동 섹션
    await expect(page.locator("h3:has-text('추천 활동')")).toBeVisible();

    // 추천 교구 섹션
    await expect(page.locator("h3:has-text('추천 교구')")).toBeVisible();

    // 첫 번째 활동 카드 확인
    const activityCards = page.locator(".overflow-hidden.transition-shadow");
    if (await activityCards.count() > 0) {
      const firstCard = activityCards.first();
      await expect(firstCard.locator("button:has-text('활동 시작하기')")).toBeVisible();
    }

    await page.screenshot({ path: "test-results/05-recommend.png", fullPage: true });
  });

  // ── 6. 추이 탭 — 필터 칩 & 트렌드 차트 ─────────────────────
  test("06 · 추이 탭 — 필터 칩 & 트렌드 차트", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "추이");

    // 탭 헤더
    await expect(page.locator("h2:has-text('성장 이야기')")).toBeVisible();

    // "전체" 필터 칩 — 기본 선택
    await expect(page.locator("button:has-text('전체')").first()).toBeVisible();

    // 도메인 필터 칩들
    for (const label of ["언어이해", "시공간", "유동추론"]) {
      await expect(page.locator(`button:has-text("${label}")`)).toBeVisible();
    }

    // 도메인 칩 클릭 → bg-primary 활성 클래스 확인
    const langChip = page.locator('button:has-text("언어이해")');
    await langChip.click({ force: true });
    await page.waitForTimeout(600);

    await expect(langChip).toHaveClass(/bg-primary/);

    // 차트 SVG 로드 대기
    await page.waitForTimeout(1000);
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();

    // 마일스톤 + AI 예측
    await expect(page.locator("h3:has-text('마일스톤')")).toBeVisible();
    await expect(page.locator("h3:has-text('AI 예측')")).toBeVisible();

    await page.screenshot({ path: "test-results/06-monthly.png", fullPage: true });
  });

  // ── 7. 설정 모달 ─────────────────────────────────────────
  test("07 · 설정 모달 — MaterialIcon & 토글", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 설정 버튼 클릭
    await page.getByRole("button", { name: "설정" }).click({ force: true });
    await page.waitForTimeout(600);

    // 모달 열림 확인
    await expect(page.locator("h3:has-text('설정')")).toBeVisible();

    // MaterialIcon 텍스트 확인 (Material Symbols는 텍스트로 렌더링)
    for (const name of ["person", "notifications", "download", "phone_iphone"]) {
      await expect(
        page.locator(`.material-symbols-outlined`).filter({ hasText: name }).first()
      ).toBeVisible();
    }

    // 알림 토글 존재
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();

    // 내보내기 버튼들
    await expect(page.locator("button:has-text('CSV 내보내기')")).toBeVisible();
    await expect(page.locator("button:has-text('JSON 백업')")).toBeVisible();

    await page.screenshot({ path: "test-results/07-settings.png", fullPage: false });

    // 닫기
    await closeBottomSheet(page);
    await expect(page.locator("h3:has-text('설정')")).not.toBeVisible();
  });

  // ── 8. 부모 가이드 모달 ───────────────────────────────────
  test("08 · 부모 가이드 — 아코디언 열기/닫기", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 가이드 버튼 클릭
    await page.getByRole("button", { name: "가이드" }).click({ force: true });
    await page.waitForTimeout(600);

    // 모달 열림 확인
    await expect(page.locator("h3:has-text('부모 가이드')")).toBeVisible();

    // 첫 번째 아코디언 ("5대 지능 영역") — 기본 열림
    await expect(page.locator("text=언어이해")).toBeVisible();

    // 다른 아코디언 클릭
    await page.locator("button:has-text('효과적인 기록 방법')").click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator("text=하루 2-3개 기록")).toBeVisible();

    // 추가 자료 링크
    await expect(page.locator("text=더 알아보기")).toBeVisible();

    await page.screenshot({ path: "test-results/08-parent-guide.png", fullPage: false });

    // 닫기
    await closeBottomSheet(page);
    await expect(page.locator("h3:has-text('부모 가이드')")).not.toBeVisible();
  });

  // ── 9. 온보딩 플로우 (새 사용자 시뮬레이션) ─────────────────
  test("09 · 온보딩 플로우 — sky blue 디자인 확인", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Step 1: bg-surface-100 배경 (OnboardingFlow div)
    const onboardingDiv = page.locator("div.min-h-screen.bg-surface-100").first();
    await expect(onboardingDiv).toBeVisible();

    // 닉네임 입력
    await page.waitForSelector("input#child-nickname");
    await page.fill("input#child-nickname", "테스트");

    // 나이 버튼 클릭 → primary 색상
    await page.locator('button:has-text("만 4세")').click({ force: true });
    await expect(
      page.locator('button:has-text("만 4세")')
    ).toHaveClass(/bg-primary/);

    await page.screenshot({ path: "test-results/09a-onboarding-step1.png" });

    // 성별 선택 후 다음
    await page.locator('button:has-text("남아")').click({ force: true });
    await page.locator('button:has-text("다음 단계")').click({ force: true });

    // Step 2: 기질 화면
    await page.waitForSelector("text=어떤 아이인가요");

    // Q1 선택 → bg-primary-50 확인
    await page.locator('button:has-text("낯선 곳도 씩씩하게")').click({ force: true });
    await expect(
      page.locator('button:has-text("낯선 곳도 씩씩하게")')
    ).toHaveClass(/bg-primary-50/);

    await page.screenshot({ path: "test-results/09b-onboarding-step2.png" });
    await page.locator('button:has-text("다음 단계")').click({ force: true });

    // Step 3: 건너뛰기 → 메인 앱
    await page.waitForSelector('button:has-text("검사 없이 시작하기")');
    await page.screenshot({ path: "test-results/09c-onboarding-step3.png" });

    await page.locator('button:has-text("검사 없이 시작하기")').click({ force: true });
    await page.waitForSelector("text=성장 트래커", { timeout: 15000 });
    await page.screenshot({ path: "test-results/09d-main-app.png" });
  });

  // ── 10. 반응형 레이아웃 ─────────────────────────────────────
  test("10 · 모바일 뷰포트 내 레이아웃 확인", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 최대 430px 제약 (outer wrapper)
    const outerMain = page.locator("main").first();
    const box = await outerMain.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(430);

    // 탭 바 하단 고정 확인
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    const navBox = await nav.boundingBox();
    expect(navBox?.y).toBeGreaterThan(600);

    await page.screenshot({ path: "test-results/10-mobile-layout.png" });
  });
});
