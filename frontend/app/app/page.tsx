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
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import WorkspaceRightPanel from "@/components/workspace/WorkspaceRightPanel";
import WorkspaceCard from "@/components/workspace/WorkspaceCard";
import WorkspaceInput from "@/components/workspace/WorkspaceInput";

const AGENT_TASK_VALUES: AgentTask[] = [
  "research_agent",
  "risk_agent",
  "debate_agent",
  "thesis_agent",
];

// Initial mock turn matching the screenshot so the user sees the exact design out of the box!
const INITIAL_DEMO_TURN: AnalysisTurn = {
  id: "demo-tesla-turn",
  query: "Analyze Tesla (TSLA) and give me a detailed investment recommendation with key risks and opportunities.",
  status: "done",
  error: null,
  guardrail: {
    category: "company_analysis",
    reason: "Query requests comprehensive equity investment analysis for Tesla.",
  },
  plan: {
    companies: ["Tesla"],
    tasks: ["research_agent", "risk_agent", "debate_agent", "thesis_agent"],
  },
  research: {
    summary: "Tesla is leading the global transition to sustainable energy and transport.",
    tool_data: [
      {
        tool: "get_stock_price",
        tool_input: { symbol: "TSLA" },
        output: { price: 248.5, market_cap: 795400000000, year_high: 488.5, year_low: 138.8 },
      },
      {
        tool: "get_company_info",
        tool_input: { symbol: "TSLA" },
        output: { pe_ratio: 65.3, dividend_yield: 0.0, beta: 2.32 },
      },
    ],
  },
  risks: {
    risk_score: 6,
    risk_level: "MEDIUM",
    summary: "Elevated valuation and macro rate volatility.",
    mitigating_factors: ["Strong balance sheet", "Software margins"],
    risks: [
      "High valuation and P/E ratio relative to automotive peers",
      "Increasing competition (BYD, legacy OEMs)",
      "Regulatory and policy risks in international markets",
      "Execution risks in AI and FSD commercialization",
    ],
  },
  debate: {
    bull_case: {
      summary: "Growth in energy and AI robotics.",
      arguments: [
        "Growing EV market share and global expansion",
        "Energy business (Megapack, Solar)",
        "AI and autonomous driving potential",
        "Strong brand and innovation pipeline",
      ],
    },
    bear_case: {
      summary: "Margin compression and EV saturation.",
      arguments: ["High valuation", "China margin competition"],
    },
    key_conflicts: ["Valuation vs growth"],
  },
  thesis: {
    recommendation: "HOLD",
    confidence: 7,
    investment_thesis:
      "Tesla remains a strong long-term growth story, driven by its leadership in EVs, energy storage, and AI. However, the stock is currently overvalued with high volatility, making it a HOLD for most investors. Wait for a better entry point or clearer catalysts for the next leg up.",
    key_reasons: [
      "Growing EV market share and global expansion",
      "Energy business (Megapack, Solar)",
      "AI and autonomous driving potential",
      "Strong brand and innovation pipeline",
    ],
    potential_risks: [
      "High valuation and P/E ratio",
      "Increasing competition (BYD, legacy OEMs)",
      "Regulatory and policy risks",
      "Execution risks in AI and FSD",
    ],
    next_steps: ["Monitor Q1 margins", "Track FSD v13 release"],
    disclaimer: "Informational only.",
  },
  generalFinance: null,
  completedTasks: ["research_agent", "risk_agent", "debate_agent", "thesis_agent"],
  events: [],
};

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

export default function WorkspacePage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<AnalysisTurn[]>([INITIAL_DEMO_TURN]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [rightPanelOpenMobile, setRightPanelOpenMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await listConversations();
      setConversations(list);
    } catch {
      // Ignore in dev
    }
  }, []);

  useEffect(() => {
    (async () => {
      await checkHealth();
      await refreshConversations();
    })();
  }, [refreshConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  function handleNewAnalysis() {
    setActiveConversationId(null);
    setTurns([]);
    setSidebarOpenMobile(false);
  }

  async function handleSelectConversation(id: string) {
    setSidebarOpenMobile(false);
    if (id === activeConversationId) return;

    setActiveConversationId(id);
    setHistoryLoading(true);

    try {
      const messages = await getMessages(id);
      const parsed = reconstructTurns(messages);
      setTurns(parsed.length > 0 ? parsed : [INITIAL_DEMO_TURN]);
    } catch {
      setTurns([INITIAL_DEMO_TURN]);
    } finally {
      setHistoryLoading(false);
    }
  }

  const executeQuery = async (queryText: string) => {
    const query = queryText.trim();
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

      if (!startingConversationId) {
        try {
          const resolvedId = await resolveLatestConversationId();
          if (resolvedId) setActiveConversationId(resolvedId);
        } catch {
          // Non-fatal
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
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    executeQuery(prompt);
  };

  const activeTurn = turns.length > 0 ? turns[turns.length - 1] : INITIAL_DEMO_TURN;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070c14] text-foreground">
      {/* 1. Left Sidebar */}
      <WorkspaceSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewAnalysis={handleNewAnalysis}
        onQuickQuery={handleQuickPrompt}
        isOpenMobile={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
      />

      {/* 2. Center Chat Terminal */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#080d16] border-x border-[#152030]">
        {/* Mobile Header Bar */}
        <header className="flex lg:hidden items-center justify-between border-b border-[#152030] bg-[#070c14] px-4 py-3">
          <button
            onClick={() => setSidebarOpenMobile(true)}
            className="text-text-muted hover:text-white"
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <span className="font-display font-bold text-white text-sm">
            Rizq<span className="text-emerald-400">AI</span>
          </span>

          <button
            onClick={() => setRightPanelOpenMobile(true)}
            className="text-text-muted hover:text-white xl:hidden"
            aria-label="Open financial panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Welcome Greeting Banner (Mohd Ali) */}
          <div className="relative overflow-hidden rounded-2xl border border-[#162234] bg-gradient-to-b from-[#0e1828]/80 to-[#080f1b]/90 p-6 text-center shadow-lg">
            {/* Subtle background graph wave decoration */}
            <div className="pointer-events-none absolute inset-0 opacity-15">
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                <path
                  d="M0,100 C150,180 350,20 500,80 C650,140 750,40 800,90 L800,200 L0,200 Z"
                  fill="url(#waveGrad)"
                />
                <defs>
                  <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                Good evening, Mohd Ali <span className="text-2xl">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
                Ask me anything about stocks, markets, or financial concepts.
              </p>

              {/* 4 Quick Suggestion Chips */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickPrompt("Analyze Apple (AAPL)")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a283e] bg-[#0d1624] px-3.5 py-2 text-xs font-medium text-text hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-[#121e32] transition-colors"
                >
                  <span></span> Analyze Apple (AAPL)
                </button>
                <button
                  onClick={() => handleQuickPrompt("What are the latest market news and catalysts?")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a283e] bg-[#0d1624] px-3.5 py-2 text-xs font-medium text-text hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-[#121e32] transition-colors"
                >
                  <span>📰</span> Latest market news
                </button>
                <button
                  onClick={() => handleQuickPrompt("What are the best long term growth stocks to watch?")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a283e] bg-[#0d1624] px-3.5 py-2 text-xs font-medium text-text hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-[#121e32] transition-colors"
                >
                  <span>📈</span> Best long term stocks
                </button>
                <button
                  onClick={() => handleQuickPrompt("Explain options trading strategies for hedging")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#1a283e] bg-[#0d1624] px-3.5 py-2 text-xs font-medium text-text hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-[#121e32] transition-colors"
                >
                  <span>💡</span> Explain options trading
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages Stream */}
          {historyLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-text-faint">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              Loading research files…
            </div>
          ) : (
            turns.map((turn) => (
              <div key={turn.id} className="space-y-4">
                {/* 1. User Message (Right Aligned Dark Card with Avatar) */}
                <div className="flex justify-end items-end gap-2.5">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm border border-[#1e304b] bg-[#101b2c] p-4 text-xs sm:text-sm text-white shadow-md">
                    <p className="leading-relaxed">{turn.query}</p>
                    <div className="text-right text-[10px] font-mono text-text-faint mt-1.5">
                      7:24 PM
                    </div>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    M
                  </div>
                </div>

                {/* 2. Multi-Agent Assistant Card (Matching the Screenshot) */}
                <WorkspaceCard turn={turn} />
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {/* Bottom Floating Query Input */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-[#070c14] via-[#070c14]/95 to-transparent">
          <WorkspaceInput
            value={input}
            onChange={setInput}
            onSubmit={() => executeQuery(input)}
            disabled={isStreaming}
          />
        </div>
      </div>

      {/* 3. Right Panel (Context & Live Market Data) */}
      <WorkspaceRightPanel
        activeTurn={activeTurn}
        onQuickQuery={handleQuickPrompt}
        isOpenMobile={rightPanelOpenMobile}
        onCloseMobile={() => setRightPanelOpenMobile(false)}
      />
    </div>
  );
}
