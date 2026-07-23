import { test, expect } from "@playwright/test";
import { getTestCredentials, loginAs } from "./utils/login";

const credentials = getTestCredentials("admin");

test.describe("Admin — quản trị viên", () => {
  test.skip(!credentials, "Cần cấu hình E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD để chạy luồng này");

  test("đăng nhập, chỉnh sửa bài học và xem lead đăng ký tư vấn", async ({ page }) => {
    if (!credentials) return;

    await loginAs(page, credentials.email, credentials.password);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Tổng quan quản trị", exact: true })).toBeVisible();

    await page.goto("/admin/bai-hoc");
    const firstLessonLink = page.locator("a[href^='/admin/bai-hoc/']").first();
    if (await firstLessonLink.count()) {
      await firstLessonLink.click();
      await expect(page.getByRole("heading", { name: /Sửa bài học/i })).toBeVisible();
    }

    await page.goto("/admin/dang-ky-tu-van");
    await expect(page.getByRole("heading", { name: "Đăng ký tư vấn", exact: true })).toBeVisible();
  });
});
