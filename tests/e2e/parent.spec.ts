import { test, expect } from "@playwright/test";
import { getTestCredentials, loginAs } from "./utils/login";

const credentials = getTestCredentials("parent");

test.describe("Parent — phụ huynh", () => {
  test.skip(!credentials, "Cần cấu hình E2E_PARENT_EMAIL / E2E_PARENT_PASSWORD để chạy luồng này");

  test("đăng nhập, chọn học viên, xem tiến độ và phản hồi", async ({ page }) => {
    if (!credentials) return;

    await loginAs(page, credentials.email, credentials.password);
    await expect(page).toHaveURL(/\/parent$/);

    const firstStudentLink = page.locator("a[href^='/parent/hoc-vien/']").first();
    await expect(firstStudentLink).toBeVisible();
    await firstStudentLink.click();
    await expect(page).toHaveURL(/\/parent\/hoc-vien\//);

    await page.getByRole("link", { name: "Tiến độ", exact: true }).click();
    await expect(page).toHaveURL(/\/parent\/tien-do\//);
    await expect(page.getByRole("heading", { name: /Tiến độ của/i })).toBeVisible();
  });
});
