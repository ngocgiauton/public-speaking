import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/schema";
import { consultationLeadSchema } from "@/features/leads/schema";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({ email: "parent@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "parent@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("consultationLeadSchema", () => {
  const validLead = {
    student_full_name: "Nguyễn Văn A",
    parent_full_name: "Nguyễn Văn B",
    phone: "0901234567",
    consent: "on" as const,
  };

  it("accepts a minimal valid submission", () => {
    const result = consultationLeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it("rejects when consent was not checked", () => {
    const result = consultationLeadSchema.safeParse({ ...validLead, consent: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const result = consultationLeadSchema.safeParse({ ...validLead, phone: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects a student name that's too short", () => {
    const result = consultationLeadSchema.safeParse({ ...validLead, student_full_name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email when one is provided", () => {
    const result = consultationLeadSchema.safeParse({ ...validLead, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty-string email (optional field)", () => {
    const result = consultationLeadSchema.safeParse({ ...validLead, email: "" });
    expect(result.success).toBe(true);
  });
});
