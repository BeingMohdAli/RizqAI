import type {
  ConversationListItem,
  MessageResponse,
  StreamEvent,
} from "./types";

export type { StreamEvent } from "./types";

// Backend mounts everything under /conversations (api/routes.py:
// `APIRouter(prefix="/conversations")`) — there is no separate /api prefix.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const CONVERSATIONS_URL = `${API_BASE_URL}/conversations`;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function asJson<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ApiError(res.status, detail || fallbackMessage);
  }
  return res.json() as Promise<T>;
}

/** GET /conversations/health */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${CONVERSATIONS_URL}/health`, { cache: "no-store" });
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: string };
    return body.status === "ok";
  } catch {
    return false;
  }
}

/** GET /conversations — most-recently-updated first (backend already sorts this way). */
export async function listConversations(): Promise<ConversationListItem[]> {
  const res = await fetch(CONVERSATIONS_URL, { cache: "no-store" });
  return asJson(res, "Failed to load conversations.");
}

/** GET /conversations/{id}/messages */
export async function getMessages(conversationId: string): Promise<MessageResponse[]> {
  const res = await fetch(`${CONVERSATIONS_URL}/${conversationId}/messages`, {
    cache: "no-store",
  });
  return asJson(res, "Failed to load conversation messages.");
}

/**
 * The backend creates a fresh conversation id server-side on the first
 * message of a thread, but /messages/stream never sends that id back over
 * SSE (schemas/conversation.py::ChatRequest / api/routes.py don't surface
 * it). There is no way to recover it from that response alone.
 *
 * Workaround: immediately after a "done" event for a turn that started with
 * conversation_id = null, re-fetch the list and take the top entry — the
 * backend bumps `updated_at` on the conversation right before sending
 * "done", and the list is already ordered by updated_at desc. This assumes
 * single-user local usage (no concurrent writers), which matches this app.
 */
export async function resolveLatestConversationId(): Promise<string | null> {
  const conversations = await listConversations();
  return conversations[0]?.id ?? null;
}

/**
 * Streams one turn from POST /conversations/messages/stream, invoking
 * `onEvent` for every Server-Sent Event as it arrives. Resolves once the
 * stream closes (after a "done" event) or rejects on a network failure.
 */
export async function streamMessage(
  query: string,
  conversationId: string | null,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${CONVERSATIONS_URL}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversation_id: conversationId }),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new ApiError(
      res.status,
      detail || `Request failed (${res.status}): ${res.statusText}`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line ("\n\n").
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;

      const jsonStr = line.slice("data: ".length);
      try {
        const event = JSON.parse(jsonStr) as StreamEvent;
        onEvent(event);
      } catch {
        // Skip malformed/partial chunks rather than crashing the stream.
      }
    }
  }
}