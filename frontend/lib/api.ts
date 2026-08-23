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

// One raw SSE payload coming off /api/analyze/stream.
// `data` holds whatever slice of GraphState that particular node returned.
export interface StreamEvent {
  node: AgentTask | "planner_agent" | "done" | "error";
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
  error?: string;
}

/**
 * Streams one analysis run from POST /api/analyze/stream, invoking
 * `onEvent` for every Server-Sent Event as it arrives. Resolves once the
 * stream closes (after a "done" event) or rejects on a network failure.
 */
export async function streamAnalysis(
  query: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
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