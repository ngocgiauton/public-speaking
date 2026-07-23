import { test, expect } from "@playwright/test";
import { getTestCredentials, loginAs } from "./utils/login";

const credentials = getTestCredentials("teacher");

test.describe("Teacher — giáo viên", () => {
  test.skip(!credentials, "Cần cấu hình E2E_TEACHER_EMAIL / E2E_TEACHER_PASSWORD để chạy luồng này");

  test("đăng nhập, xem bài chờ chấm, mở bài nộp và chấm điểm", async ({ page }) => {
    if (!credentials) return;

    await loginAs(page, credentials.email, credentials.password);
    await expect(page).toHaveURL(/\/teacher$/);

    await page.goto("/teacher/bai-cho-cham");
    await expect(page.getByRole("heading", { name: "Bài chờ chấm", exact: true })).toBeVisible();

    const firstGradeLink = page.getByRole("link", { name: /Chấm bài/i }).first();
    if (await firstGradeLink.count()) {
      await firstGradeLink.click();
      await expect(page).toHaveURL(/\/teacher\/cham-bai\//);
      await expect(page.getByRole("heading", { name: /Chấm bài/i })).toBeVisible();

      const decisionSelect = page.locator("#decision");
      if (await decisionSelect.count()) {
        await decisionSelect.selectOption("approved");
        await page.getByRole("button", { name: /Gửi kết quả chấm bài/i }).click();
        await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
      }
    }
  });
});
