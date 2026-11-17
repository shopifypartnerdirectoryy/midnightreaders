import { z } from "zod";

export const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;
export const PAYMENT_PROOF_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;

export const communityApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Keep your name under 100 characters."),
  email: z.string().trim().email("Enter a valid email address.").max(255, "Keep your email under 255 characters."),
  applicationType: z.enum(["payment", "existing"]),
  existingMemberId: z.string().trim().max(36),
  message: z.string().trim().max(1000, "Keep your note under 1,000 characters."),
}).superRefine((value, context) => {
  if (value.applicationType === "existing" && !/^MRC-[A-Z0-9-]{4,32}$/i.test(value.existingMemberId)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["existingMemberId"],
      message: "Enter an ID beginning with MRC-, using only letters, numbers and hyphens.",
    });
  }
});

export function normalizeExistingMemberId(value: string) {
  return value.trim().toUpperCase();
}

export function validatePaymentProof(file: Pick<File, "size" | "type">) {
  if (!PAYMENT_PROOF_TYPES.includes(file.type as (typeof PAYMENT_PROOF_TYPES)[number])) {
    return "Upload a JPG, PNG or PDF receipt.";
  }
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > MAX_PAYMENT_PROOF_BYTES) return "The receipt must be 5 MB or smaller.";
  return null;
}
