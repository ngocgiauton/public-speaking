import { describe, expect, it } from "vitest";
import { canTransitionSubmission, isEditableByStudent } from "@/features/submissions/status";

describe("canTransitionSubmission", () => {
  it("allows draft -> submitted", () => {
    expect(canTransitionSubmission("draft", "submitted")).toBe(true);
  });

  it("allows submitted -> under_review", () => {
    expect(canTransitionSubmission("submitted", "under_review")).toBe(true);
  });

  it("allows under_review -> approved, revision_requested, or rejected", () => {
    expect(canTransitionSubmission("under_review", "approved")).toBe(true);
    expect(canTransitionSubmission("under_review", "revision_requested")).toBe(true);
    expect(canTransitionSubmission("under_review", "rejected")).toBe(true);
  });

  it("allows revision_requested -> resubmitted, and rejected -> resubmitted", () => {
    expect(canTransitionSubmission("revision_requested", "resubmitted")).toBe(true);
    expect(canTransitionSubmission("rejected", "resubmitted")).toBe(true);
  });

  it("does not allow approved to transition anywhere", () => {
    expect(canTransitionSubmission("approved", "resubmitted")).toBe(false);
    expect(canTransitionSubmission("approved", "draft")).toBe(false);
  });

  it("does not allow skipping states, e.g. draft -> approved", () => {
    expect(canTransitionSubmission("draft", "approved")).toBe(false);
  });

  it("does not allow a student to silently revert submitted back to draft", () => {
    expect(canTransitionSubmission("submitted", "draft")).toBe(false);
  });
});

describe("isEditableByStudent", () => {
  it("is editable while draft, revision_requested, or rejected", () => {
    expect(isEditableByStudent("draft")).toBe(true);
    expect(isEditableByStudent("revision_requested")).toBe(true);
    expect(isEditableByStudent("rejected")).toBe(true);
  });

  it("is not editable once submitted, under review, resubmitted, or approved", () => {
    expect(isEditableByStudent("submitted")).toBe(false);
    expect(isEditableByStudent("under_review")).toBe(false);
    expect(isEditableByStudent("resubmitted")).toBe(false);
    expect(isEditableByStudent("approved")).toBe(false);
  });
});
