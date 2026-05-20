import { queueSubmission } from "./submissionQueue";

export const LEAD_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwBguGwHzRmv5vRNwrbZKeE5NXT73dLSaEDGroZL4LuZvFEUDd6ikDW4xWeH4NH69TA/exec";

export interface LeadPayload {
  name: string;
  phone: string;
  review?: string;
  reviews?: string;
  feedback?: string;
  suggestion?: string;
  comment?: string;
  rating?: string | number;
}

export async function submitLead({
  name,
  phone,
  review,
  reviews,
  feedback,
  suggestion,
  comment,
  rating,
}: LeadPayload): Promise<void> {
  const reviewText = (review ?? reviews ?? feedback ?? suggestion ?? comment ?? "").trim();
  const payload = {
    name: name.trim(),
    phone: normalizePhone(phone),
    timestamp: new Date().toISOString(),
    review: reviewText,
    reviews: reviewText,
    feedback: reviewText,
    suggestion: reviewText,
    comment: reviewText,
    rating: rating ?? "",
  };

  try {
    queueSubmission(LEAD_ENDPOINT, payload);
    console.log("[lead] saved locally and started background sync", {
      hasName: Boolean(payload.name),
      hasPhone: Boolean(payload.phone),
      reviewLength: payload.review.length,
      rating: payload.rating,
    });
  } catch (error) {
    console.error("[lead] unable to save submission locally", error);
    throw new Error("Unable to save your details. Please try again.");
  }
}

export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}
