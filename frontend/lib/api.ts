import type {
  ConversationListItem,
  MessageResponse,
  StreamEvent,
} from "./types";

export type { StreamEvent } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const CONVERSATIONS_URL = `${API_BASE_URL}/conversations`;
const AUTH_URL = `${API_BASE_URL}/auth`;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rizqai_token");
  }
  return null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function asJson<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(detail);
      throw new ApiError(res.status, parsed.detail || fallbackMessage);
    } catch {
      throw new ApiError(res.status, detail || fallbackMessage);
    }
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth Endpoints
// ---------------------------------------------------------------------------

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
  expires_at?: number;
  user_id: string;
  email?: string;
}

export async function loginUser(email: string, password: string): Promise<SessionResponse> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return asJson<SessionResponse>(res, "Invalid email or password.");
}

export async function signupUser(
  email: string,
  password: string
): Promise<SessionResponse | { message: string }> {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return asJson<SessionResponse | { message: string }>(res, "Signup failed.");
}

export async function logoutUser(): Promise<{ message: string }> {
  const res = await fetch(`${AUTH_URL}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return asJson<{ message: string }>(res, "Failed to sign out.");
}

export async function getOAuthUrl(provider: "google" | "github"): Promise<{ url: string }> {
  const res = await fetch(`${AUTH_URL}/oauth/${provider}`);
  return asJson<{ url: string }>(res, `Failed to initialize ${provider} login.`);
}

// ---------------------------------------------------------------------------
// Conversation & Stream Endpoints
// ---------------------------------------------------------------------------

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

/** GET /conversations — most-recently-updated first */
export async function listConversations(): Promise<ConversationListItem[]> {
  const res = await fetch(CONVERSATIONS_URL, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return asJson(res, "Failed to load conversations.");
}

/** GET /conversations/{id}/messages */
export async function getMessages(conversationId: string): Promise<MessageResponse[]> {
  const res = await fetch(`${CONVERSATIONS_URL}/${conversationId}/messages`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return asJson(res, "Failed to load conversation messages.");
}

export async function resolveLatestConversationId(): Promise<string | null> {
  const conversations = await listConversations();
  return conversations[0]?.id ?? null;
}

/**
 * Streams one turn from POST /conversations/messages/stream, invoking
 * `onEvent` for every Server-Sent Event as it arrives.
 */
export async function streamMessage(
  query: string,
  conversationId: string | null,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${CONVERSATIONS_URL}/messages/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ query, conversation_id: conversationId }),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    let errorMessage = detail || `Request failed (${res.status}): ${res.statusText}`;
    try {
      const parsed = JSON.parse(detail);
      if (parsed.detail) errorMessage = parsed.detail;
    } catch {
      // Keep detail
    }
    throw new ApiError(res.status, errorMessage);
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
