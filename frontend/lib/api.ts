import type { ConversationListItem, MessageResponse, StreamEvent } from "./types";

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

export function getStoredRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rizqai_refresh_token");
  }
  return null;
}

export function clearStoredTokens(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("rizqai_token");
    localStorage.removeItem("rizqai_refresh_token");
    localStorage.removeItem("rizqai_user_id");
    localStorage.removeItem("rizqai_user_email");
    localStorage.removeItem("rizqai_user_name");
  }
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
    let message = detail || fallbackMessage;
    try {
      const parsed = JSON.parse(detail);
      message = parsed.detail || message;
    } catch {
      // The response may be plain text.
    }
    throw new ApiError(res.status, message);
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
  name?: string;
}

export interface CurrentUserResponse {
  user_id: string;
  name: string;
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

export async function requestSignupOtp(
  email: string,
  password: string
): Promise<{ message: string }> {
  const res = await fetch(`${AUTH_URL}/signup/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return asJson<{ message: string }>(res, "Unable to generate signup OTP.");
}

export async function verifySignupOtp(
  email: string,
  password: string,
  otp: string,
  name: string
): Promise<SessionResponse> {
  const res = await fetch(`${AUTH_URL}/signup/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, otp, name }),
  });
  return asJson<SessionResponse>(res, "Unable to verify signup OTP.");
}

export async function refreshAuthSession(refreshToken: string): Promise<SessionResponse> {
  const res = await fetch(`${AUTH_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return asJson<SessionResponse>(res, "Session expired. Please sign in again.");
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

export async function exchangeOAuthCode(code: string): Promise<SessionResponse> {
  const res = await fetch(`${AUTH_URL}/callback?code=${encodeURIComponent(code)}`, {
    cache: "no-store",
  });
  return asJson<SessionResponse>(res, "OAuth authentication failed.");
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUserResponse> {
  const res = await fetch(`${AUTH_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return asJson<CurrentUserResponse>(res, "Unable to validate OAuth session.");
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
    headers: { ...getAuthHeaders() },
  });
  return asJson(res, "Failed to load conversations.");
}

/** GET /conversations/{id}/messages */
export async function getMessages(conversationId: string): Promise<MessageResponse[]> {
  const res = await fetch(`${CONVERSATIONS_URL}/${conversationId}/messages`, {
    cache: "no-store",
    headers: { ...getAuthHeaders() },
  });
  return asJson(res, "Failed to load conversation messages.");
}

/** DELETE /conversations/{id} */
export async function deleteConversation(conversationId: string): Promise<{ status: string }> {
  const res = await fetch(`${CONVERSATIONS_URL}/${conversationId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return asJson(res, "Failed to delete conversation.");
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
