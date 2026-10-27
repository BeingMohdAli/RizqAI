"use client";

import { useState } from "react";
import type { AgentTask, AnalysisTurn } from "@/lib/types";

interface WorkspaceCardProps {
  turn: AnalysisTurn;
}

export default function WorkspaceCard({ turn }: WorkspaceCardProps) {
  const [showAllSources, setShowAllSources] = useState(false);

  // 1. Handle error state
  if (turn.status === "error" && !turn.thesis && !turn.generalFinance) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-[#160c14] p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
          <span>⚠️</span>
          <span>Analysis Interrupted</span>
        </div>
        <p className="text-xs text-rose-200/90 leading-relaxed">
          {turn.error || "The research desk encountered an error processing your query. Please try again."}
        </p>
      </div>
    );
  }

  // 2. Handle out-of-scope / irrelevant questions
  if (turn.guardrail?.category === "irrelevant") {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-[#14120a] p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
          <span>🛡️</span>
          <span>Out of Financial Research Scope</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          {turn.guardrail.reason || "This query falls outside RizqAI's financial and investment scope. Ask about stocks, earnings, or market concepts."}
        </p>
      </div>
    );
  }

  // 3. Handle General Finance questions
  if (turn.generalFinance) {
    const gf = turn.generalFinance;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
            ⚡
          </div>
          <span className="font-semibold text-white">RizqAI Financial Desk</span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 capitalize">
            {gf.mode === "memory_followup" ? "Context Follow-up" : "Financial Concept"}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#1a283e] bg-[#0c1421] p-5 sm:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{turn.query}</h3>
            <p className="mt-2 text-xs sm:text-[13px] text-text leading-relaxed whitespace-pre-line">{gf.answer}</p>
          </div>

          {gf.key_points && gf.key_points.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-[#091522] p-4 space-y-2">
              <div className="text-xs font-semibold text-emerald-400">Key Takeaways</div>
              <ul className="space-y-1.5 text-xs text-text-muted">
                {gf.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Company Analysis Card
  const companyName = turn.plan?.companies?.[0] || "Target Equity";
  const ticker = companyName.toUpperCase();

  // Extract metrics from real research tool data
  let price = "—";
  let priceDelta = "";
  let marketCap = "—";
  let peRatio = "—";
  let fiftyTwoRange = "—";
  let dividendYield = "—";
  const toolOutputs = turn.research?.tool_data || [];

  for (const step of toolOutputs) {
    if (step.tool === "get_stock_price" && typeof step.output === "object" && step.output !== null) {
      const quote = step.output as Record<string, unknown>;
      if (quote.price !== undefined && quote.price !== null) {
        price = `$${quote.price}`;
      }
      if (quote.year_high && quote.year_low) {
        fiftyTwoRange = `$${quote.year_low} - $${quote.year_high}`;
      }
      if (quote.market_cap) {
        const mc = Number(quote.market_cap);
        marketCap = mc >= 1e12 ? `$${(mc / 1e12).toFixed(2)}T` : mc >= 1e9 ? `$${(mc / 1e9).toFixed(1)}B` : `$${mc.toLocaleString()}`;
      }
      if (quote.previous_close && quote.price) {
        const diff = Number(quote.price) - Number(quote.previous_close);
        const pct = (diff / Number(quote.previous_close)) * 100;
        priceDelta = `${diff >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
      }
    }
    if (step.tool === "get_company_info" && typeof step.output === "object" && step.output !== null) {
      const info = step.output as Record<string, unknown>;
      if (info.market_cap && marketCap === "—") {
        const mc = Number(info.market_cap);
        marketCap = mc >= 1e12 ? `$${(mc / 1e12).toFixed(2)}T` : mc >= 1e9 ? `$${(mc / 1e9).toFixed(1)}B` : `$${mc.toLocaleString()}`;
      }
      if (info.pe_ratio !== undefined && info.pe_ratio !== null) {
        peRatio = String(Number(info.pe_ratio).toFixed(2));
      }
      if (info.dividend_yield !== undefined && info.dividend_yield !== null) {
        dividendYield = `${(Number(info.dividend_yield) * 100).toFixed(2)}%`;
      }
    }
  }

  // Thesis details
  const recommendation = turn.thesis?.recommendation || (turn.status === "streaming" ? "EVALUATING" : "NEUTRAL");
  const confidence = turn.thesis?.confidence ? `${turn.thesis.confidence}/10` : (turn.status === "streaming" ? "Pending" : "—");
  const thesisNarrative = turn.thesis?.investment_thesis || (turn.status === "streaming" ? "Specialist agents are conducting real-time research and adversarial evaluation..." : "Detailed thesis will appear once research completes.");

  // Key Opportunities
  const opportunities = turn.thesis?.key_reasons?.length
    ? turn.thesis.key_reasons
    : turn.debate?.bull_case?.arguments?.length
    ? turn.debate.bull_case.arguments.slice(0, 4)
    : [];

  // Key Risks
  const risks = turn.risks?.risks?.length
    ? turn.risks.risks.slice(0, 4)
    : turn.thesis?.potential_risks?.length
    ? turn.thesis.potential_risks.slice(0, 4)
    : turn.debate?.bear_case?.arguments?.length
    ? turn.debate.bear_case.arguments.slice(0, 4)
    : [];

  // Recommendation Badge Style
  const recBadgeStyle =
    recommendation === "BUY"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
      : recommendation === "SELL"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
      : "border-amber-500/40 bg-amber-500/10 text-amber-400";

  const completed = turn.completedTasks || [];
  const isStreaming = turn.status === "streaming";
  const agentCount = isStreaming ? "Running agents…" : `${completed.length || 6} agents completed`;

  const pipelineSteps: { name: string; key: AgentTask }[] = [
    { name: "Research", key: "research_agent" },
    { name: "Risk", key: "risk_agent" },
    { name: "Debate", key: "debate_agent" },
    { name: "Thesis", key: "thesis_agent" },
  ];

  return (
    <div className="space-y-2">
      {/* Agent Identification Header */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          ⚡
        </div>
        <span className="font-semibold text-white">RizqAI Desk</span>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          {isStreaming && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />}
          {agentCount}
        </div>
      </div>

      {/* Main Analysis Card Container */}
      <div className="overflow-hidden rounded-2xl border border-[#1a283e] bg-[#0c1421] p-5 sm:p-6 shadow-xl space-y-5">
        {/* Company Header & Recommendation Badge */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#18253a] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-lg shadow-md">
              {companyName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {companyName} ({ticker})
              </h3>
              <p className="text-xs text-text-muted">Multi-Agent Equity Research</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${recBadgeStyle}`}>
              {recommendation}
            </div>
            <span className="text-[10px] font-mono text-text-faint mt-1">
              Confidence: {confidence}
            </span>
          </div>
        </div>

        {/* Financial Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-xl border border-[#162234] bg-[#090f19] p-3 text-xs font-mono">
          <div>
            <div className="text-[10px] text-text-faint">Price</div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {price} {priceDelta && <span className="text-[10px] text-emerald-400 font-normal">{priceDelta}</span>}
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
        {(opportunities.length > 0 || risks.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.length > 0 && (
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
            )}

            {risks.length > 0 && (
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
            )}
          </div>
        )}

        {/* Sources & Citations Strip */}
        {toolOutputs.length > 0 && (
          <div className="border-t border-[#18253a] pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-faint">
                <span>Verified Sources:</span>
                {toolOutputs.map((step, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded bg-[#101928] px-2 py-0.5 text-text-muted border border-[#1a283e]">
                    <span className="text-emerald-400">✓</span> {step.tool.replace(/^get_/, "")}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setShowAllSources(!showAllSources)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {showAllSources ? "Hide details ↑" : "Inspect data →"}
              </button>
            </div>

            {showAllSources && (
              <div className="mt-3 rounded-xl border border-[#162234] bg-[#070c14] p-3 text-xs font-mono space-y-2 max-h-60 overflow-y-auto">
                {toolOutputs.map((step, idx) => (
                  <div key={idx} className="border-t border-[#152030] first:border-0 pt-2 text-[10px]">
                    <span className="text-emerald-400 font-semibold">{step.tool}</span>
                    <pre className="mt-1 text-text-faint overflow-x-auto whitespace-pre-wrap">
                      {typeof step.output === "object" ? JSON.stringify(step.output, null, 2) : String(step.output)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Multi-Agent Execution Progress Bar */}
        <div className="border-t border-[#18253a] pt-3">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2 font-mono text-[10px]">
            {pipelineSteps.map((step, idx) => {
              const isDone = completed.includes(step.key) || (!isStreaming && turn.status === "done");
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
