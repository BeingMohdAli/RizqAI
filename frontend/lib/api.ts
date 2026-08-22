import type {
  AgentTask,
  DebateAgentState,
  PlannerState,
  ResearchData,
  RiskState,
  ThesisAgentState,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

// One raw SSE payload coming off /conversations/messages/stream.
// `data` holds whatever slice of GraphState that particular node returned.
export interface StreamEvent {
  node: AgentTask | "planner_agent" | "conversation" | "done" | "error";
  data?: {
    success?: boolean;
    error?: string | null;
    plan?: PlannerState;
    research?: ResearchData;
    risks?: RiskState;
    debate?: DebateAgentState;
    thesis?: ThesisAgentState;
    completed_tasks?: AgentTask[];
  };
  conversation_id?: string;
  error?: string;
}

export interface ConversationListItem {
  id: string;
  title: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/**
 * Fetches the list of saved conversations, most recently updated first.
 */
export async function getConversations(): Promise<ConversationListItem[]> {
  const res = await fetch(`${API_BASE_URL}/conversations`);
  if (!res.ok) {
    throw new Error(`Failed to load conversations (${res.status})`);
  }
  return res.json();
}

/**
 * Fetches every stored message (user + assistant) for one conversation,
 * oldest first.
 */
export async function getConversationMessages(
  conversationId: string
): Promise<MessageRecord[]> {
  const res = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`
  );
  if (!res.ok) {
    throw new Error(`Failed to load messages (${res.status})`);
  }
  return res.json();
}

/**
 * Streams one analysis run from POST /conversations/messages/stream, invoking
 * `onEvent` for every Server-Sent Event as it arrives. Resolves once the
 * stream closes (after a "done" event) or rejects on a network failure.
 *
 * Pass `conversationId` to continue an existing thread; omit/pass null to
 * start a new one (the backend will return its id via a "conversation" event).
 */
export async function streamAnalysis(
  query: string,
  onEvent: (event: StreamEvent) => void,
  conversationId?: string | null,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/conversations/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      conversation_id: conversationId ?? null,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status}): ${detail || res.statusText}`
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