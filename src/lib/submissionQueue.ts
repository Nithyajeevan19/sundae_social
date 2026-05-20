type SubmissionStatus = "pending";

export interface QueuedSubmission<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  endpoint: string;
  payload: TPayload;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
}

const QUEUE_KEY = "sundaeSocial.pendingSubmissions";
const SYNC_TIMEOUT_MS = 5000;
let syncing = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readQueue(): QueuedSubmission[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[submission-queue] unable to read queue", error);
    return [];
  }
}

function writeQueue(queue: QueuedSubmission[]) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn("[submission-queue] unable to save queue", error);
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function postSubmission(endpoint: string, payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export function queueSubmission<TPayload extends Record<string, unknown>>(
  endpoint: string,
  payload: TPayload,
) {
  const now = new Date().toISOString();
  const item: QueuedSubmission<TPayload> = {
    id: makeId(),
    endpoint,
    payload,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    attempts: 0,
  };

  writeQueue([...readQueue(), item]);
  console.log("[submission-queue] queued submission", {
    id: item.id,
    hasName: Boolean(payload.name),
    hasPhone: Boolean(payload.phone),
    reviewLength: typeof payload.review === "string" ? payload.review.length : 0,
    rating: payload.rating ?? "",
  });

  void syncPendingSubmissions();
  return item;
}

export async function syncPendingSubmissions() {
  if (syncing) return;
  syncing = true;

  try {
    const queue = readQueue();
    if (!queue.length) return;

    console.log("[submission-queue] syncing pending submissions", { count: queue.length });

    for (const item of queue) {
      try {
        await postSubmission(item.endpoint, item.payload);
        writeQueue(readQueue().filter((queued) => queued.id !== item.id));
        console.log("[submission-queue] synced submission", { id: item.id });
      } catch (error) {
        const nextQueue = readQueue().map((queued) =>
          queued.id === item.id
            ? {
                ...queued,
                attempts: queued.attempts + 1,
                updatedAt: new Date().toISOString(),
              }
            : queued,
        );
        writeQueue(nextQueue);
        console.warn("[submission-queue] sync failed; keeping queued", {
          id: item.id,
          error,
        });
      }
    }
  } finally {
    syncing = false;
  }
}
