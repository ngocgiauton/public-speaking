import { test, expect } from "@playwright/test";

/**
 * Luồng Guest — không phụ thuộc Supabase thật, chạy được trong mọi môi trường
 * CI (kể cả khi chưa cấu hình secret) vì các trang công khai có fallback dữ
 * liệu mặc định (xem src/lib/data/public-content.ts).
 */

test.describe("Guest — khách chưa đăng nhập", () => {
  test("mở trang chủ và thấy nội dung giới thiệu chương trình", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Public Speaking – Diễn Giả Nhí/i })).toBeVisible();
    await expect(page.getByText("Speak to Lead").first()).toBeVisible();
  });

  test("xem trang chương trình", async ({ page }) => {
    await page.goto("/chuong-trinh");
    await expect(page.getByRole("heading", { name: "Chương trình", exact: true })).toBeVisible();
    await expect(page.getByText("Body Language")).toBeVisible();
  });

  test("xem trang lộ trình 22 buổi", async ({ page }) => {
    await page.goto("/lo-trinh");
    await expect(page.getByRole("heading", { name: /Lộ trình 22 buổi/i })).toBeVisible();
  });

  test("xem câu hỏi thường gặp", async ({ page }) => {
    await page.goto("/cau-hoi-thuong-gap");
    await expect(page.getByRole("heading", { name: "Câu hỏi thường gặp", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Chương trình phù hợp với độ tuổi nào/i })).toBeVisible();
  });

  test("mở form đăng ký tư vấn và thấy validate các trường bắt buộc", async ({ page }) => {
    await page.goto("/dang-ky-tu-van");
    await expect(page.getByRole("heading", { name: "Đăng ký tư vấn", exact: true })).toBeVisible();

    const submitButton = page.getByRole("button", { name: /Gửi đăng ký tư vấn/i });
    await submitButton.click();

    // Trình duyệt chặn submit vì trường "Họ tên học viên" (required) còn trống.
    const studentNameInput = page.locator("#student_full_name");
    await expect(studentNameInput).toHaveJSProperty("validity.valid", false);
  });

  test("truy cập khu vực học viên khi chưa đăng nhập sẽ được chuyển hướng tới trang đăng nhập", async ({ page }) => {
    await page.goto("/student");
    await expect(page).toHaveURL(/\/dang-nhap/);
  });
});
