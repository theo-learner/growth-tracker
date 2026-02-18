import { test, expect } from "@playwright/test";

test.describe("Growth Tracker App", () => {
  test("loads the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/성장 트래커/);
  });

  test("shows onboarding for new users", async ({ page }) => {
    // Clear localStorage to simulate new user
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Should show onboarding step
    await expect(page.locator("text=기본 정보")).toBeVisible({ timeout: 10000 });
  });

  test("onboarding flow - step 1 input", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill in child nickname
    const nicknameInput = page.locator('input[placeholder*="별명"], input[placeholder*="이름"]').first();
    if (await nicknameInput.isVisible()) {
      await nicknameInput.fill("테스트아이");
      await expect(nicknameInput).toHaveValue("테스트아이");
    }
  });

  test("has proper meta tags for SEO", async ({ page }) => {
    await page.goto("/");
    
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("has main landmark for accessibility", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("responsive layout within 430px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    const main = page.locator("main");
    const box = await main.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(430);
    }
  });

  test("error page renders correctly", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-12345");
    // Should show not-found or 404
    expect(response?.status()).toBe(404);
  });
});
