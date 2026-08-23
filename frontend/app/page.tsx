"use client";

import { useEffect, useRef, useState } from "react";
import {
  streamAnalysis,
  getConversationMessages,
  type StreamEvent,
  type MessageRecord,
} from "@/lib/api";
import type { AgentTask, AnalysisTurn } from "@/lib/types";
import ChatTurn from "@/components/ChatTurn";
import QueryInput from "@/components/QueryInput";
import Sidebar from "@/components/Sidebar";

const AGENT_TASK_VALUES: AgentTask[] = [
  "research_agent",
  "risk_agent",
  "debate_agent",
  "thesis_agent",
];

function newTurn(query: string): AnalysisTurn {
  return {
    id: crypto.randomUUID(),
    query,
    status: "streaming",
    error: null,
    plan: null,
    research: null,
    risks: null,
    debate: null,
    thesis: null,
    completedTasks: [],
  };
}

function applyEvent(turn: AnalysisTurn, event: StreamEvent): AnalysisTurn {
  if (event.node === "done") {
    return turn.status === "error" ? turn : { ...turn, status: "done" };
  }

  if (event.node === "error") {
    return { ...turn, status: "error", error: event.error ?? "Something went wrong." };
  }

  const data = event.data;
  if (!data) return turn;

  const next: AnalysisTurn = { ...turn };

  if (data.plan) next.plan = data.plan;
  if (data.research) next.research = data.research;
  if (data.risks) next.risks = data.risks;
  if (data.debate) next.debate = data.debate;
  if (data.thesis) next.thesis = data.thesis;

  if (data.success === false) {
    next.status = "error";
    next.error = data.error ?? "The desk hit a snag.";
    return next;
  }

  if (AGENT_TASK_VALUES.includes(event.node as AgentTask)) {
    const task = event.node as AgentTask;
    if (!next.completedTasks.includes(task)) {
      next.completedTasks = [...next.completedTasks, task];
    }
  }

  return next;
}

function turnFromMessages(
  userMsg: MessageRecord,
  assistantMsg?: MessageRecord
): AnalysisTurn {
  const base = newTurn(userMsg.content);

  if (!assistantMsg) {
    return {
      ...base,
      status: "error",
      error: "No response was saved for this turn.",
    };
  }

  try {
    const state = JSON.parse(assistantMsg.content);
    return {
      ...base,
      status: state.success === false ? "error" : "done",
      error:
        state.success === false
          ? state.error ?? "The desk hit a snag."
          : null,
      plan: state.plan ?? null,
      research: state.research ?? null,
      risks: state.risks ?? null,
      debate: state.debate ?? null,
      thesis: state.thesis ?? null,
      completedTasks: state.completed_tasks ?? [],
    };
  } catch {
    return {
      ...base,
      status: "error",
      error: "Couldn't parse the saved response for this turn.",
    };
  }
}

export default function Home() {
  const [turns, setTurns] = useState<AnalysisTurn[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  function handleNewChat() {
    if (isStreaming) return;
    setTurns([]);
    setInput("");
    setActiveConversationId(null);
  }

  async function handleSelectConversation(id: string) {
    if (isStreaming || id === activeConversationId) return;

    setActiveConversationId(id);
    setLoadingHistory(true);

    try {
      const messages = await getConversationMessages(id);
      const rebuilt: AnalysisTurn[] = [];

      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role !== "user") continue;
        const next = messages[i + 1];
        const assistantMsg = next?.role === "assistant" ? next : undefined;
        rebuilt.push(turnFromMessages(messages[i], assistantMsg));
      }

      setTurns(rebuilt);
    } catch {
      setTurns([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSubmit() {
    const query = input.trim();
    if (!query || isStreaming) return;

    const turn = newTurn(query);
    setTurns((prev) => [...prev, turn]);
    setInput("");
    setIsStreaming(true);

    try {
      await streamAnalysis(
        query,
        (event) => {
          if (event.node === "conversation" && event.conversation_id) {
            setActiveConversationId((prev) => prev ?? event.conversation_id!);
            return;
          }
          setTurns((prev) =>
            prev.map((t) => (t.id === turn.id ? applyEvent(t, event) : t))
          );
        },
        activeConversationId
      );
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turn.id
            ? {
                ...t,
                status: "error",
                error: err instanceof Error ? err.message : "Network error.",
              }
            : t
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  const isEmpty = turns.length === 0 && !loadingHistory;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeConversationId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        refreshKey={refreshKey}
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-line-soft bg-ink/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold tracking-tight text-text">
                Rizq<span className="text-gold">AI</span>
              </span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint sm:inline">
                the desk
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center">
              <div className="space-y-3">
                <h1 className="font-display text-4xl italic leading-tight text-text sm:text-5xl">
                  Your desk, working.
                </h1>
                <p className="mx-auto max-w-md text-[15px] leading-relaxed text-text-muted">
                  Ask about a stock. A planner, a research analyst, a risk
                  desk, a bull, and a bear will each take a pass before the
                  verdict lands.
                </p>
              </div>
              <div className="w-full max-w-xl">
                <QueryInput
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={isStreaming}
                  showExamples
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-8 py-6">
                {loadingHistory && (
                  <p className="text-center text-xs text-text-faint">
                    Loading conversation…
                  </p>
                )}
                {turns.map((turn) => (
                  <ChatTurn key={turn.id} turn={turn} />
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-ink via-ink/95 to-transparent px-4 pb-6 pt-8 sm:-mx-6 sm:px-6">
                <QueryInput
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={isStreaming}
                  showExamples={false}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}