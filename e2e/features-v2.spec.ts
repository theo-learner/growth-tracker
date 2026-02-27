/**
 * v2 신규 기능 E2E 테스트
 * browser-testing.md 업데이트 내용 기반
 *
 * 커버 범위:
 *  - 난이도 정량 추적 (퍼즐/블록 프리셋 버튼, 카테고리 변경 초기화)
 *  - 난이도 포함 저장 → 타임라인 텍스트 형식
 *  - 두 번째 동일 카테고리 기록 → "지난번 대비" 배지
 *  - 입력 검증 (카테고리 없이 저장, 601분 알림)
 *  - CompletionScreen 팁 텍스트 매핑 (퍼즐/블록/질문/감정/사진)
 *  - 사진 AI 분석하기 버튼 표시
 *  - 리포트 탭 — 발달 구간 band 텍스트 + 레이더 차트
 *  - 추이 탭 — 영역 필터 + 마일스톤
 *  - 설정 모달 열기
 */

import { test, expect, type Page } from "@playwright/test";

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

async function goToTab(page: Page, label: "홈" | "리포트" | "놀이" | "추이") {
  await page.locator(`nav button:has-text("${label}")`).click({ force: true });
  await page.waitForTimeout(500);
}

async function openRecordSheet(
  page: Page,
  type: "활동" | "질문" | "독서" | "감정" | "사진"
) {
  const btn = page.getByRole("button", { name: `${type} 기록하기` });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true });
  await page.waitForTimeout(800);
}

// nav 바(fixed bottom-0 z-50)가 저장 버튼을 시각적으로 덮으므로
// native element.click()으로 직접 이벤트 발송 (오버레이 무시)
async function saveRecordForm(page: Page) {
  const dialog = page.locator('[role="dialog"]');
  const saveBtn = dialog.getByRole("button", { name: "기록 완료" });
  await expect(saveBtn).toBeVisible({ timeout: 5000 });
  await saveBtn.evaluate((el: HTMLElement) => el.click());
  await page.waitForTimeout(600);
}

async function closeCompletionScreen(page: Page) {
  const confirmBtn = page.getByRole("button", { name: "확인" }).first();
  await expect(confirmBtn).toBeVisible({ timeout: 5000 });
  await confirmBtn.evaluate((el: HTMLElement) => el.click());
  await page.waitForTimeout(500);
}

// ─── Test 21~24: 난이도 정량 추적 ─────────────────────────────────────────

test.describe("난이도 정량 추적 — 프리셋 UI", () => {
  test("21 · 퍼즐 선택 → 난이도 프리셋 버튼 4개 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 퍼즐 카테고리 선택
    await dialog.locator("button:has-text('퍼즐')").click();
    await page.waitForTimeout(400);

    // 퍼즐 난이도 프리셋 버튼 4개 확인
    const presets = ["36조각", "72조각", "108조각", "180조각"];
    for (const preset of presets) {
      await expect(
        dialog.locator(`button:has-text('${preset}')`)
      ).toBeVisible({ timeout: 3000 });
    }

    await page.screenshot({ path: "test-results/v2-21-puzzle-presets.png" });

    // 닫기
    await dialog.getByRole("button", { name: "닫기" }).click({ force: true });
    await page.waitForTimeout(300);
  });

  test("22 · 블록 선택 → [5층][10층][20층] 표시 + 카테고리 변경 시 초기화", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 퍼즐 먼저 선택 → 72조각 클릭 (난이도 설정)
    await dialog.locator("button:has-text('퍼즐')").click();
    await page.waitForTimeout(400);
    await dialog.locator("button:has-text('72조각')").click();
    await page.waitForTimeout(300);

    // 선택 확인 (primary 배경)
    const preset72 = dialog.locator("button:has-text('72조각')");
    const cls72 = await preset72.getAttribute("class");
    expect(cls72).toContain("bg-primary");

    // 블록으로 카테고리 전환
    await dialog.locator("button:has-text('블록')").click();
    await page.waitForTimeout(400);

    // 블록 난이도 버튼 3개 확인
    for (const preset of ["5층", "10층", "20층"]) {
      await expect(
        dialog.locator(`button:has-text('${preset}')`)
      ).toBeVisible({ timeout: 3000 });
    }

    // 퍼즐 난이도 버튼은 사라져야 함 (카테고리 변경 → 초기화)
    await expect(
      dialog.locator("button:has-text('72조각')")
    ).not.toBeVisible();

    await page.screenshot({ path: "test-results/v2-22-block-presets.png" });

    await dialog.getByRole("button", { name: "닫기" }).click({ force: true });
    await page.waitForTimeout(300);
  });

  test("23 · 퍼즐 108조각 저장 → 타임라인 '퍼즐 · 108조각 — 30분' 텍스트", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 퍼즐 선택
    await dialog.locator("button:has-text('퍼즐')").click();
    await page.waitForTimeout(400);

    // 108조각 프리셋 선택
    await dialog.locator("button:has-text('108조각')").click();
    await page.waitForTimeout(300);

    // 소요 시간 30분
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("30");
    await page.waitForTimeout(200);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });
    await closeCompletionScreen(page);

    // 타임라인에 난이도 포함 텍스트 확인
    await expect(
      page.locator("text=퍼즐 · 108조각").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-23-timeline-difficulty.png" });
  });

  test("24 · 두 번째 퍼즐 기록 → 타임라인 '지난번 대비' 배지 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // ── 1차 기록: 퍼즐 72조각 ───────────────────────
    await openRecordSheet(page, "활동");
    let dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator("button:has-text('퍼즐')").click();
    await page.waitForTimeout(400);
    await dialog.locator("button:has-text('72조각')").click();
    await page.waitForTimeout(300);

    const dur1 = dialog.locator('input[placeholder="예: 30"]');
    await dur1.fill("45");
    await page.waitForTimeout(200);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });
    await closeCompletionScreen(page);
    await page.waitForTimeout(300);

    // ── 2차 기록: 퍼즐 108조각 ───────────────────────
    await openRecordSheet(page, "활동");
    dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator("button:has-text('퍼즐')").click();
    await page.waitForTimeout(400);
    await dialog.locator("button:has-text('108조각')").click();
    await page.waitForTimeout(300);

    const dur2 = dialog.locator('input[placeholder="예: 30"]');
    await dur2.fill("40");
    await page.waitForTimeout(200);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });
    await closeCompletionScreen(page);

    // ── 타임라인에서 "지난번 대비" 텍스트 확인 ────────
    await expect(
      page.locator("text=지난번 대비").first()
    ).toBeVisible({ timeout: 5000 });

    // "+36조각" 배지 (108 - 72 = 36)
    await expect(
      page.locator("text=+36조각").first()
    ).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: "test-results/v2-24-prev-comparison.png" });
  });
});

// ─── Test 25~26: 입력 검증 ────────────────────────────────────────────────

test.describe("입력 검증", () => {
  test("25 · 카테고리 없이 저장 → CompletionScreen 미표시 (저장 안 됨)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 카테고리 선택 없이 소요 시간만 입력
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("30");
    await page.waitForTimeout(200);

    // 저장 시도
    await saveRecordForm(page);

    // CompletionScreen이 표시되지 않아야 함
    await expect(
      page.locator("h3:has-text('기록 완료!')")
    ).not.toBeVisible();

    // 다이얼로그가 여전히 열려 있어야 함
    await expect(dialog).toBeVisible();

    await page.screenshot({ path: "test-results/v2-25-no-category-validation.png" });

    // 닫기
    await dialog.getByRole("button", { name: "닫기" }).click({ force: true });
    await page.waitForTimeout(300);
  });

  test("26 · 601분 입력 → alert '0~600분' 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 카테고리 선택
    await dialog.locator("button:has-text('미술')").click();
    await page.waitForTimeout(300);

    // 601분 입력
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("601");
    await page.waitForTimeout(200);

    // alert 처리
    let capturedMessage = "";
    page.once("dialog", async (alertDlg) => {
      capturedMessage = alertDlg.message();
      await alertDlg.dismiss();
    });

    await saveRecordForm(page);
    await page.waitForTimeout(500);

    // alert 메시지에 "0~600분" 포함 확인
    expect(capturedMessage, "600분 초과 시 alert가 표시되어야 함").toContain("0~600분");

    // CompletionScreen 미표시 확인
    await expect(page.locator("h3:has-text('기록 완료!')")). not.toBeVisible();

    await page.screenshot({ path: "test-results/v2-26-duration-validation.png" });

    // 닫기
    await dialog.getByRole("button", { name: "닫기" }).click({ force: true });
    await page.waitForTimeout(300);
  });
});

// ─── Test 27~31: CompletionScreen 팁 텍스트 ───────────────────────────────

test.describe("CompletionScreen 팁 텍스트 매핑", () => {
  test("27 · 퍼즐 기록 → '시공간 능력과 집중력' 팁 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator("button:has-text('퍼즐')").click();
    await page.waitForTimeout(300);
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("30");
    await page.waitForTimeout(200);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 퍼즐 팁 확인
    await expect(
      page.locator("text=시공간 능력과 집중력이 자랐어요").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-27-tip-puzzle.png" });
    await closeCompletionScreen(page);
  });

  test("28 · 블록 기록 → '입체적으로 생각하는 힘' 팁 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "활동");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator("button:has-text('블록')").click();
    await page.waitForTimeout(300);
    const durationInput = dialog.locator('input[placeholder="예: 30"]');
    await durationInput.fill("30");
    await page.waitForTimeout(200);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 블록 팁 확인
    await expect(
      page.locator("text=입체적으로 생각하는 힘이 길러지고 있어요").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-28-tip-block.png" });
    await closeCompletionScreen(page);
  });

  test("29 · 질문 기록 → '유동추론 능력의 가장 확실한 지표' 팁 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "질문");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const questionInput = dialog.locator("textarea").first();
    await questionInput.fill("왜 하늘은 파란색이야?");
    await page.waitForTimeout(200);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 질문 팁 확인
    await expect(
      page.locator("text=유동추론 능력의 가장 확실한 지표예요").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-29-tip-question.png" });
    await closeCompletionScreen(page);
  });

  test("30 · 감정 기록 → '감정을 표현하는 것 자체가 중요한' 팁 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "감정");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 😊 행복 선택
    await dialog.locator("button:has-text('행복')").click();
    await page.waitForTimeout(300);

    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 감정 팁 확인
    await expect(
      page.locator("text=감정을 표현하는 것 자체가 중요한").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-30-tip-emotion.png" });
    await closeCompletionScreen(page);
  });

  test("31 · 사진 기록 → '관찰력을 보여주는 훌륭한 기록' 팁 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    await openRecordSheet(page, "사진");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 이미지 없이 바로 저장 (imageData없이도 저장 가능)
    await saveRecordForm(page);
    await expect(page.locator("h3:has-text('기록 완료!')")).toBeVisible({ timeout: 5000 });

    // 사진 팁 확인
    await expect(
      page.locator("text=관찰력을 보여주는 훌륭한 기록이에요").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-31-tip-photo.png" });
    await closeCompletionScreen(page);
  });
});

// ─── Test 32: 사진 AI 분석 버튼 ──────────────────────────────────────────

test.describe("사진 AI 분석", () => {
  test("32 · 사진 + imageData 있는 기록 → 타임라인 'AI 분석하기' 버튼 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1×1 픽셀 PNG base64 (최소 유효 이미지)
    const tinyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    // localStorage에 imageData 포함 사진 기록 직접 주입
    await page.evaluate((imgData) => {
      const raw = localStorage.getItem("growth-tracker-storage");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const photoRecord = {
        id: `act-photo-ai-test-${Date.now()}`,
        type: "photo" as const,
        timestamp: new Date().toISOString(),
        data: {
          fileName: "test-photo.jpg",
          note: "AI 분석 테스트 사진",
          imageData: imgData,
          // aiAnalysis 없음 → 버튼이 표시되어야 함
        },
      };
      // activities (active child)
      parsed.state.activities.unshift(photoRecord);
      // allActivities
      const childId = parsed.state.activeChildId;
      if (childId && parsed.state.allActivities[childId]) {
        parsed.state.allActivities[childId].unshift(photoRecord);
      }
      localStorage.setItem("growth-tracker-storage", JSON.stringify(parsed));
    }, tinyBase64);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await goToTab(page, "홈");

    // 타임라인에서 "AI 분석하기" 버튼 확인
    await expect(
      page.locator("button:has-text('AI 분석하기')").first()
    ).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: "test-results/v2-32-ai-analyze-btn.png" });
  });
});

// ─── Test 33: 리포트 탭 ───────────────────────────────────────────────────

test.describe("리포트 탭 — 발달 구간 & 레이더 차트", () => {
  test("33 · 리포트 탭 — 레이더 차트 렌더링 + 발달 구간 band 텍스트", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "리포트");

    // 레이더 차트 로딩 대기 (lazy loaded recharts)
    await page.waitForTimeout(2000);

    // recharts SVG가 렌더링되어야 함
    const svgChart = page.locator("svg.recharts-surface").first();
    await expect(svgChart).toBeVisible({ timeout: 10000 });

    // 발달 구간 band 텍스트 ("상위 N~M%" 형식) 확인
    const bandText = page.locator("text=/상위 \\d+~\\d+%/").first();
    await expect(bandText).toBeVisible({ timeout: 5000 });

    // AI 요약 카드 확인 (highlights[0])
    const aiCard = page.locator("div.bg-primary-50").first();
    await expect(aiCard).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-33-report-tab.png", fullPage: false });
  });
});

// ─── Test 34~35: 추이 탭 & 설정 ─────────────────────────────────────────

test.describe("추이 탭 & 설정", () => {
  test("34 · 추이 탭 — 영역 필터 칩 활성/비활성 스타일", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "추이");

    // 차트 로딩 대기
    await page.waitForTimeout(1500);

    // "언어이해" 칩 클릭
    const verbChip = page.locator("button:has-text('언어이해')").first();
    await expect(verbChip).toBeVisible({ timeout: 5000 });
    await verbChip.click({ force: true });
    await page.waitForTimeout(500);

    // 클릭 후 칩에 active 스타일 (bg-primary) 적용 확인
    const activeClass = await verbChip.getAttribute("class");
    expect(activeClass, "활성 칩은 bg-primary 클래스를 포함해야 함").toContain("bg-primary");

    await page.screenshot({ path: "test-results/v2-34-trend-filter.png" });
  });

  test("35 · 추이 탭 — 마일스톤 목록 표시", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await goToTab(page, "추이");

    // 마일스톤 섹션으로 스크롤
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
    await page.waitForTimeout(800);

    // 샘플 마일스톤 "72조각 퍼즐" 확인
    await expect(
      page.locator("text=72조각 퍼즐").first()
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: "test-results/v2-35-milestones.png" });
  });
});
