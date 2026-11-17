import { describe, expect, it } from "vitest";
import {
  communityApplicationSchema,
  MAX_PAYMENT_PROOF_BYTES,
  normalizeExistingMemberId,
  validatePaymentProof,
} from "@/lib/community-access";

const validDetails = {
  fullName: "Ada Reader",
  email: "ada@example.com",
  applicationType: "payment" as const,
  existingMemberId: "",
  message: "",
};

describe("community access applications", () => {
  it("accepts a new-member application with valid contact details", () => {
    expect(communityApplicationSchema.safeParse(validDetails).success).toBe(true);
  });

  it("requires an MRC ID when applying as an existing member", () => {
    const result = communityApplicationSchema.safeParse({ ...validDetails, applicationType: "existing" });
    expect(result.success).toBe(false);
  });

  it("normalizes an existing member ID for duplicate checks", () => {
    expect(normalizeExistingMemberId("  mrc-2026-ab12cd  ")).toBe("MRC-2026-AB12CD");
  });

  it("accepts only image or PDF payment receipts", () => {
    expect(validatePaymentProof({ type: "application/pdf", size: 1200 })).toBeNull();
    expect(validatePaymentProof({ type: "text/plain", size: 1200 })).toMatch(/JPG, PNG or PDF/);
  });

  it("rejects payment receipts larger than 5 MB", () => {
    expect(validatePaymentProof({ type: "image/png", size: MAX_PAYMENT_PROOF_BYTES + 1 })).toMatch(/5 MB or smaller/);
    expect(validatePaymentProof({ type: "image/png", size: MAX_PAYMENT_PROOF_BYTES })).toBeNull();
  });
});
