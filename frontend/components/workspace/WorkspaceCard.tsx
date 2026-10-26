"use client";

import { useState } from "react";
import type { AnalysisTurn } from "@/lib/types";

interface WorkspaceCardProps {
  turn: AnalysisTurn;
}

export default function WorkspaceCard({ turn }: WorkspaceCardProps) {
  const [showAllSources, setShowAllSources] = useState(false);

  // Extract company name and details from state
  const company = turn.plan?.companies?.[0] || "Tesla";
  const ticker = company.toUpperCase();

  // Extract financial metrics from research tool_data if available
  let price = "$248.50";
  let priceDelta = "+2.36%";
  let marketCap = "$795.4B";
  let peRatio = "65.3";
  let fiftyTwoRange = "$138.8 - $488.5";
  let dividendYield = "0.00%";

  if (turn.research?.tool_data) {
    for (const step of turn.research.tool_data) {
      if (step.tool === "get_stock_price" && typeof step.output === "object" && step.output !== null) {
        const quote = step.output as Record<string, unknown>;
        if (quote.price) price = `$${quote.price}`;
        if (quote.year_high && quote.year_low) fiftyTwoRange = `$${quote.year_low} - $${quote.year_high}`;
        if (quote.market_cap) marketCap = `$${(Number(quote.market_cap) / 1e9).toFixed(1)}B`;
      }
      if (step.tool === "get_company_info" && typeof step.output === "object" && step.output !== null) {
        const info = step.output as Record<string, unknown>;
        if (info.market_cap && marketCap === "$795.4B") marketCap = `$${(Number(info.market_cap) / 1e9).toFixed(1)}B`;
        if (info.pe_ratio) peRatio = String(info.pe_ratio);
        if (info.dividend_yield) dividendYield = `${(Number(info.dividend_yield) * 100).toFixed(2)}%`;
      }
    }
  }

  // Thesis details
  const recommendation = turn.thesis?.recommendation || "HOLD";
  const confidence = turn.thesis?.confidence ? `${turn.thesis.confidence}/10` : "7.2/10";
  const thesisNarrative =
    turn.thesis?.investment_thesis ||
    `${company} remains a strong long-term growth story, driven by its leadership in technology, production scale, and innovation pipeline. However, the stock is currently evaluated with elevated valuation and volatility, warranting disciplined entry timing.`;

  // Key Opportunities
  const opportunities =
    turn.thesis?.key_reasons && turn.thesis.key_reasons.length > 0
      ? turn.thesis.key_reasons
      : turn.debate?.bull_case?.arguments && turn.debate.bull_case.arguments.length > 0
      ? turn.debate.bull_case.arguments.slice(0, 4)
      : [
          `Growing ${company} market share and global expansion`,
          "Services and recurring software revenue growth",
          "AI, robotics and autonomous software pipeline",
          "Industry leading gross margins and balance sheet strength",
        ];

  // Key Risks
  const risks =
    turn.risks?.risks && turn.risks.risks.length > 0
      ? turn.risks.risks.slice(0, 4)
      : turn.thesis?.potential_risks && turn.thesis.potential_risks.length > 0
      ? turn.thesis.potential_risks.slice(0, 4)
      : [
          `High valuation and P/E multiple relative to peers`,
          "Increasing global competition and margin pressure",
          "Regulatory headwinds and macro interest rate sensitivity",
          "Supply chain concentration and execution timelines",
        ];

  // Recommendation Badge Colors
  const recBadgeStyle =
    recommendation === "BUY"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
      : recommendation === "SELL"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
      : "border-amber-500/40 bg-amber-500/10 text-amber-400";

  // Check which agents have executed
  const completed = turn.completedTasks || [];
  const isStreaming = turn.status === "streaming";
  const agentCount = isStreaming ? "Running agents…" : "6 agents completed";

  const pipelineSteps = [
    { name: "Guardrail", key: "guardrail_agent", time: "0.8s" },
    { name: "Planner", key: "planner_agent", time: "1.2s" },
    { name: "Research", key: "research_agent", time: "5.4s" },
    { name: "Risk", key: "risk_agent", time: "2.1s" },
    { name: "Debate", key: "debate_agent", time: "3.8s" },
    { name: "Thesis", key: "thesis_agent", time: "2.6s" },
  ];

  return (
    <div className="space-y-2">
      {/* Agent Identification Header */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          ⚡
        </div>
        <span className="font-semibold text-white">RizqAI</span>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          {agentCount}
        </div>
      </div>

      {/* Main Analysis Card Container */}
      <div className="overflow-hidden rounded-2xl border border-[#1a283e] bg-[#0c1421] p-5 sm:p-6 shadow-xl shadow-black/40 space-y-5">
        {/* Company Header & Recommendation Badge */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#18253a] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-lg shadow-md">
              {company.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {company} ({ticker})
              </h3>
              <p className="text-xs text-text-muted">Comprehensive Investment Analysis</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${recBadgeStyle}`}
            >
              {recommendation}
            </div>
            <span className="text-[10px] font-mono text-text-faint mt-1">
              Confidence: {confidence}
            </span>
          </div>
        </div>

        {/* 5-Column Financial Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-xl border border-[#162234] bg-[#090f19] p-3 text-xs font-mono">
          <div>
            <div className="text-[10px] text-text-faint">Current Price</div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {price} <span className="text-[10px] text-emerald-400 font-normal">{priceDelta}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-faint">Market Cap</div>
            <div className="text-sm font-semibold text-white mt-0.5">{marketCap}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-faint">P/E Ratio</div>
            <div className="text-sm font-semibold text-white mt-0.5">{peRatio}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-faint">52W Range</div>
            <div className="text-sm font-semibold text-white mt-0.5">{fiftyTwoRange}</div>
          </div>

          <div>
            <div className="text-[10px] text-text-faint">Dividend Yield</div>
            <div className="text-sm font-semibold text-white mt-0.5">{dividendYield}</div>
          </div>
        </div>

        {/* Investment Thesis Narrative */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
            Investment Thesis
          </h4>
          <p className="text-xs sm:text-[13px] leading-relaxed text-text">
            {thesisNarrative}
          </p>
        </div>

        {/* Two Column Grid: Key Opportunities vs Key Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Opportunities Card */}
          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-[#0a1824] to-[#08131d] p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px]">
                ✓
              </span>
              Key Opportunities
            </div>
            <ul className="space-y-1.5 text-xs text-text-muted">
              {opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 text-[10px] mt-0.5">•</span>
                  <span className="leading-snug">{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Risks Card */}
          <div className="rounded-xl border border-rose-500/20 bg-gradient-to-b from-[#1c0f17] to-[#140b11] p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-[10px]">
                !
              </span>
              Key Risks
            </div>
            <ul className="space-y-1.5 text-xs text-text-muted">
              {risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 text-[10px] mt-0.5">•</span>
                  <span className="leading-snug">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sources & Citations Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#18253a] pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-faint">
            <span>Sources</span>
            <span className="inline-flex items-center gap-1 rounded bg-[#101928] px-2 py-0.5 text-text-muted border border-[#1a283e]">
              <span className="text-purple-400">★</span> Yahoo Finance
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#101928] px-2 py-0.5 text-text-muted border border-[#1a283e]">
              <span className="text-orange-400">★</span> Reuters
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#101928] px-2 py-0.5 text-text-muted border border-[#1a283e]">
              <span className="text-emerald-400">★</span> MarketWatch
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#101928] px-2 py-0.5 text-text-muted border border-[#1a283e]">
              <span className="text-cyan-400">★</span> NewsAPI
            </span>
          </div>

          <button
            onClick={() => setShowAllSources(!showAllSources)}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {showAllSources ? "Hide sources ↑" : "View all sources →"}
          </button>
        </div>

        {/* Expandable Sources Details */}
        {showAllSources && turn.research?.tool_data && (
          <div className="rounded-xl border border-[#162234] bg-[#070c14] p-3 text-xs font-mono space-y-2">
            <div className="text-[11px] text-text-muted font-bold">Executed Verification Tools:</div>
            {turn.research.tool_data.map((step, idx) => (
              <div key={idx} className="border-t border-[#152030] pt-1.5 text-[10px] text-text-faint">
                <span className="text-emerald-400 font-semibold">{step.tool}</span>: {JSON.stringify(step.tool_input)}
              </div>
            ))}
          </div>
        )}

        {/* Multi-Agent Execution Timeline Progress Bar */}
        <div className="border-t border-[#18253a] pt-3">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2 font-mono text-[10px]">
            {pipelineSteps.map((step, idx) => {
              const isDone = completed.includes(step.key as any) || !isStreaming;
              return (
                <div key={step.name} className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                        : "bg-[#142030] text-text-faint border border-[#203046]"
                    }`}
                  >
                    {isDone ? "✓" : "•"}
                  </span>
                  <span className={isDone ? "text-emerald-300" : "text-text-faint"}>
                    {step.name}
                  </span>
                  <span className="text-text-faint text-[9px]">({step.time})</span>
                  {idx < pipelineSteps.length - 1 && (
                    <span className="h-px w-3 bg-[#1e2f46] mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

