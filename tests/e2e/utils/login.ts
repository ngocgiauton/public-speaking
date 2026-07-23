import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/dang-nhap");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /Đăng nhập/i }).click();
}

/**
 * Các luồng cần đăng nhập yêu cầu một môi trường Supabase test thật với tài
 * khoản demo (xem README.md — "Kiểm thử end-to-end"). Trả về thông tin đăng
 * nhập nếu đã cấu hình, ngược lại trả về null để test tự skip.
 */
export function getTestCredentials(role: "student" | "teacher" | "parent" | "admin") {
  const email = process.env[`E2E_${role.toUpperCase()}_EMAIL`];
  const password = process.env[`E2E_${role.toUpperCase()}_PASSWORD`];
  if (!email || !password) return null;
  return { email, password };
}
