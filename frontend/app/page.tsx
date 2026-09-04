"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkHealth,
  getMessages,
  listConversations,
  resolveLatestConversationId,
  streamMessage,
  type StreamEvent,
} from "@/lib/api";
import type { AgentTask, AnalysisTurn, ConversationListItem } from "@/lib/types";
import { reconstructTurns } from "@/lib/parseHistory";
import { summarizeEvent } from "@/lib/streamLog";
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
    guardrail: null,
    plan: null,
    research: null,
    risks: null,
    debate: null,
    thesis: null,
    generalFinance: null,
    completedTasks: [],
    events: [],
  };
}

function applyEvent(turn: AnalysisTurn, event: StreamEvent): AnalysisTurn {
  const { summary, success } = summarizeEvent(event);
  const turnWithLog: AnalysisTurn = {
    ...turn,
    events: [
      ...turn.events,
      { id: crypto.randomUUID(), node: event.node, timestamp: Date.now(), summary, success },
    ],
  };

  if (event.node === "done") {
    return turnWithLog.status === "error" ? turnWithLog : { ...turnWithLog, status: "done" };
  }

  if (event.node === "error") {
    return { ...turnWithLog, status: "error", error: event.error ?? "Something went wrong." };
  }

  const data = event.data;
  if (!data) return turnWithLog;

  const next: AnalysisTurn = { ...turnWithLog };

  if (data.guardrail) next.guardrail = data.guardrail;
  if (data.plan) next.plan = data.plan;
  if (data.research) next.research = data.research;
  if (data.risks) next.risks = data.risks;
  if (data.debate) next.debate = data.debate;
  if (data.thesis) next.thesis = data.thesis;
  if (data.general_finance) next.generalFinance = data.general_finance;

  // Any node (guardrail, planner, or an analysis agent) can fail this way —
  // api/routes.py stops the graph but still sends "done" afterward, so the
  // failure only ever shows up inside a node's own data payload.
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

export default function Home() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<AnalysisTurn[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "open" | "closed">("checking");
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await listConversations();
      setConversations(list);
      setStatus("open");
    } catch {
      setStatus("closed");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const healthy = await checkHealth();
      setStatus(healthy ? "open" : "closed");
      await refreshConversations();
    })();
  }, [refreshConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  function handleNewAnalysis() {
    setActiveConversationId(null);
    setTurns([]);
    setLoadError(null);
    setSidebarOpenMobile(false);
  }

  async function handleSelectConversation(id: string) {
    setSidebarOpenMobile(false);
    if (id === activeConversationId) return;

    setActiveConversationId(id);
    setHistoryLoading(true);
    setLoadError(null);

    try {
      const messages = await getMessages(id);
      setTurns(reconstructTurns(messages));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load that conversation.");
      setTurns([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmit() {
    const query = input.trim();
    if (!query || isStreaming) return;

    const turn = newTurn(query);
    const startingConversationId = activeConversationId;

    setTurns((prev) => [...prev, turn]);
    setInput("");
    setIsStreaming(true);

    try {
      await streamMessage(query, startingConversationId, (event) => {
        setTurns((prev) => prev.map((t) => (t.id === turn.id ? applyEvent(t, event) : t)));
      });

      // The stream never reports the conversation id it created (see
      // lib/api.ts::resolveLatestConversationId), so on the first message of
      // a new thread we have to go look it up after the fact.
      if (!startingConversationId) {
        try {
          const resolvedId = await resolveLatestConversationId();
          if (resolvedId) setActiveConversationId(resolvedId);
        } catch {
          // Non-fatal — the turn already rendered fine from the live stream.
        }
      }

      await refreshConversations();
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

  const isEmpty = turns.length === 0 && !historyLoading;

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewAnalysis={handleNewAnalysis}
        status={status}
        isOpenMobile={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line-soft bg-ink/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpenMobile(true)}
            aria-label="Open menu"
            className="text-text-muted transition-colors hover:text-gold"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display text-base font-semibold tracking-tight text-text">
            Rizq<span className="text-gold">AI</span>
          </span>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 sm:px-6">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center">
              <div className="space-y-3">
                <h1 className="font-display text-4xl italic leading-tight text-text sm:text-5xl">
                  Your desk, working.
                </h1>
                <p className="mx-auto max-w-md text-[15px] leading-relaxed text-text-muted">
                  Ask about a stock. A planner, a research analyst, a risk desk,
                  a bull, and a bear will each take a pass before the verdict
                  lands.
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
                {historyLoading && (
                  <div className="flex items-center gap-3 py-8">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold animate-pulse-dot" />
                    <span className="text-sm text-text-faint">Pulling up the file…</span>
                  </div>
                )}
                {loadError && (
                  <div className="rounded-lg border border-bear/30 bg-bear-soft px-4 py-3 text-sm text-bear">
                    {loadError}
                  </div>
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