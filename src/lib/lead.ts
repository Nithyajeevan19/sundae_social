export const LEAD_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxRq0ePyA1jF1e_0-tS67EeWWEZ1987M9ueUq5cdDjMxYG_AJq3uVFxWDYiATaUF9ib/exec";

export interface LeadPayload {
  name: string;
  phone: string;
}

export interface FeedbackPayload {
  name?: string;
  phone?: string;
  emotion: string;
  chips: string[];
  feedback: string;
}

export async function submitLead({ name, phone }: LeadPayload): Promise<void> {
  const payload = {
    name: name.trim(),
    phone: normalizePhone(phone),
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(LEAD_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Unable to save your details. Please try again.");
  }
}

export async function submitFeedback({
  name,
  phone,
  emotion,
  chips,
  feedback,
}: FeedbackPayload): Promise<void> {
  const payload = {
    name: name?.trim() || "",
    phone: phone ? normalizePhone(phone) : "",
    emotion,
    chips,
    feedback: feedback.trim(),
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(LEAD_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Unable to save your feedback. Please try again.");
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
