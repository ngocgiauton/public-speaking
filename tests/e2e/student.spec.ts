import { test, expect } from "@playwright/test";
import { getTestCredentials, loginAs } from "./utils/login";

/**
 * Luồng Student — yêu cầu một Supabase project test thật đã chạy seed data
 * (supabase/seed.sql + pnpm seed:demo), với biến môi trường
 * E2E_STUDENT_EMAIL / E2E_STUDENT_PASSWORD trỏ tới một tài khoản demo học
 * viên. Tự động skip nếu chưa cấu hình — xem README.md.
 */
const credentials = getTestCredentials("student");

test.describe("Student — học viên", () => {
  test.skip(!credentials, "Cần cấu hình E2E_STUDENT_EMAIL / E2E_STUDENT_PASSWORD để chạy luồng này");

  test("đăng nhập, xem dashboard, vào bài học, làm quiz và nộp bài", async ({ page }) => {
    if (!credentials) return;

    await loginAs(page, credentials.email, credentials.password);
    await expect(page).toHaveURL(/\/student$/);
    await expect(page.getByRole("heading", { name: /Chào/i })).toBeVisible();

    await page.goto("/student/lo-trinh");
    await expect(page.getByRole("heading", { name: "Lộ trình của tôi", exact: true })).toBeVisible();

    const firstAvailableLesson = page.locator("a[href^='/student/bai-hoc/']").first();
    if (await firstAvailableLesson.count()) {
      await firstAvailableLesson.click();
      await expect(page).toHaveURL(/\/student\/bai-hoc\//);

      const quizSubmitButton = page.getByRole("button", { name: /Nộp bài quiz/i });
      if (await quizSubmitButton.count()) {
        await quizSubmitButton.click();
        await expect(page.getByText(/Điểm của bạn/i)).toBeVisible();
      }
    }

    await page.goto("/student/bai-tap");
    await expect(page.getByRole("heading", { name: "Bài tập", exact: true })).toBeVisible();
  });
});
