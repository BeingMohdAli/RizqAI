"use client";

import { useState } from "react";
import type { AnalysisTurn } from "@/lib/types";

interface WorkspaceRightPanelProps {
  activeTurn?: AnalysisTurn | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NewsArticle {
  title?: string | null;
  source?: string | null;
  url?: string | null;
  published_at?: string | null;
  description?: string | null;
}

export default function WorkspaceRightPanel({
  activeTurn,
  isOpenMobile,
  onCloseMobile,
}: WorkspaceRightPanelProps) {
  const [activeTab, setActiveTab] = useState<"News" | "Financials" | "Analysis">("Financials");

  const planCompany = activeTurn?.plan?.companies?.[0];
  const researchData = activeTurn?.research;
  const toolOutputs = researchData?.tool_data || [];

  let companyName = planCompany || (activeTurn?.query ? "Target Equity" : "Market Overview");
  let exchangePrice = "—";
  let description = "Select or submit an analysis query to view verified financial data.";
  let marketCap = "—";
  let peRatio = "—";
  let forwardPe = "—";
  let fiftyTwoHigh = "—";
  let fiftyTwoLow = "—";
  let dividendYield = "—";
  let beta = "—";
  let eps = "—";
  let sector = "—";
  let industry = "—";
  const newsArticles: NewsArticle[] = [];

  for (const step of toolOutputs) {
    if (step.tool === "get_company_info" && typeof step.output === "object" && step.output !== null) {
      const info = step.output as Record<string, unknown>;
      if (info.name) companyName = String(info.name);
      if (info.summary) description = String(info.summary).slice(0, 240) + "…";
      if (info.sector) sector = String(info.sector);
      if (info.industry) industry = String(info.industry);
      if (info.market_cap) {
        const mc = Number(info.market_cap);
        marketCap = mc >= 1e12 ? `$${(mc / 1e12).toFixed(2)}T` : mc >= 1e9 ? `$${(mc / 1e9).toFixed(1)}B` : `$${mc.toLocaleString()}`;
      }
      if (info.pe_ratio !== undefined && info.pe_ratio !== null) peRatio = String(Number(info.pe_ratio).toFixed(2));
      if (info.forward_pe !== undefined && info.forward_pe !== null) forwardPe = String(Number(info.forward_pe).toFixed(2));
      if (info["52_week_high"] || info.fiftyTwoWeekHigh) fiftyTwoHigh = `$${info["52_week_high"] || info.fiftyTwoWeekHigh}`;
      if (info["52_week_low"] || info.fiftyTwoWeekLow) fiftyTwoLow = `$${info["52_week_low"] || info.fiftyTwoWeekLow}`;
      if (info.dividend_yield !== undefined && info.dividend_yield !== null) dividendYield = `${(Number(info.dividend_yield) * 100).toFixed(2)}%`;
      if (info.beta !== undefined && info.beta !== null) beta = String(Number(info.beta).toFixed(2));
      if (info.eps !== undefined && info.eps !== null) eps = `$${Number(info.eps).toFixed(2)}`;
    }
    if (step.tool === "get_stock_price" && typeof step.output === "object" && step.output !== null) {
      const quote = step.output as Record<string, unknown>;
      if (quote.price !== undefined && quote.price !== null) {
        exchangePrice = `${quote.currency || "USD"} · $${quote.price}`;
      }
      if (quote.year_high && fiftyTwoHigh === "—") fiftyTwoHigh = `$${quote.year_high}`;
      if (quote.year_low && fiftyTwoLow === "—") fiftyTwoLow = `$${quote.year_low}`;
    }
    if (step.tool === "get_company_news" && typeof step.output === "object" && step.output !== null) {
      const newsOutput = step.output as Record<string, unknown>;
      if (Array.isArray(newsOutput.articles)) {
        for (const art of newsOutput.articles) {
          if (art && typeof art === "object") {
            newsArticles.push(art as NewsArticle);
          }
        }
      }
    }
  }

  const symbolIcon = (planCompany || companyName || "•").slice(0, 1).toUpperCase();

  const content = (
    <div className="flex h-full flex-col justify-between p-4 bg-[#070c14] border-l border-[#152030] text-text overflow-y-auto select-none">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#152030]/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs font-mono font-medium text-text-muted">Live Intelligence Desk</span>
          </div>

          <span className="font-mono text-[10px] text-text-faint">
            {activeTurn ? "Active Turn" : "Standby"}
          </span>
        </div>

        {/* Tab Navigation Filter: News / Financials / Analysis */}
        <div className="flex items-center justify-between border-b border-[#152030] pb-1 text-xs">
          {(["News", "Financials", "Analysis"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-emerald-400 text-emerald-400 font-semibold"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Company Card Header */}
        <div className="space-y-2 border-b border-[#152030]/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-sm bg-emerald-600 shadow-sm">
              {symbolIcon}
            </div>
            <div className="min-w-0 flex-1 truncate">
              <h4 className="text-sm font-bold text-white truncate leading-tight">{companyName}</h4>
              <p className="text-[11px] font-mono text-emerald-400 font-medium">{exchangePrice}</p>
            </div>
          </div>
          {sector !== "—" && (
            <div className="flex gap-2 text-[10px] font-mono text-text-faint">
              <span>{sector}</span>
              <span>•</span>
              <span>{industry}</span>
            </div>
          )}
          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Tab 1: Financials Filter */}
        {activeTab === "Financials" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-[#152030] bg-[#09101b] p-3 space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint pb-1 border-b border-[#152030]/60">
                Key Fundamental Stats
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Market Cap</span>
                  <span className="text-white font-semibold">{marketCap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Trailing P/E</span>
                  <span className="text-white font-semibold">{peRatio}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Forward P/E</span>
                  <span className="text-white font-semibold">{forwardPe}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">EPS</span>
                  <span className="text-white font-semibold">{eps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">52W High</span>
                  <span className="text-white font-semibold">{fiftyTwoHigh}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">52W Low</span>
                  <span className="text-white font-semibold">{fiftyTwoLow}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Dividend Yield</span>
                  <span className="text-white font-semibold">{dividendYield}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Beta</span>
                  <span className="text-white font-semibold">{beta}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-text-faint">
              Market metrics retrieved directly via Yahoo Finance tools.
            </p>
          </div>
        )}

        {/* Tab 2: News Filter */}
        {activeTab === "News" && (
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              Verified Headlines ({newsArticles.length})
            </div>

            {newsArticles.length > 0 ? (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {newsArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#162234] bg-[#09101b] p-3 space-y-1.5 transition-colors hover:border-emerald-500/30"
                  >
                    <div className="flex items-center justify-between text-[10px] text-text-faint font-mono">
                      <span className="text-emerald-400 font-semibold">{article.source || "NewsAPI"}</span>
                      {article.published_at && (
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    {article.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white hover:text-emerald-300 transition-colors line-clamp-2 block leading-snug"
                      >
                        {article.title || "Untitled Article"} ↗
                      </a>
                    ) : (
                      <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                        {article.title || "Untitled Article"}
                      </p>
                    )}
                    {article.description && (
                      <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#162234] bg-[#09101b] p-4 text-center">
                <p className="text-xs text-text-muted">
                  {activeTurn ? "No external news headlines returned for this turn." : "Run a company analysis to stream verified headlines."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Analysis Filter */}
        {activeTab === "Analysis" && (
          <div className="space-y-3">
            {activeTurn?.thesis ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-500/30 bg-[#091522] p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-text-faint">Consensus Verdict</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {activeTurn.thesis.recommendation}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-faint font-mono">
                    Confidence: {activeTurn.thesis.confidence}/10
                  </div>
                </div>

                {activeTurn.debate && (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs">
                      <div className="font-semibold text-emerald-400 mb-1">Bull Case Summary</div>
                      <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                        {activeTurn.debate.bull_case?.summary || "Favorable market positioning."}
                      </p>
                    </div>

                    <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-2.5 text-xs">
                      <div className="font-semibold text-rose-400 mb-1">Bear Case Summary</div>
                      <p className="text-[11px] text-rose-100/90 leading-relaxed">
                        {activeTurn.debate.bear_case?.summary || "Downside risks identified."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTurn.risks && (
                  <div className="rounded-xl border border-[#162234] bg-[#09101b] p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted font-mono">Assessed Risk Score</span>
                      <span className="font-mono font-bold text-amber-400">{activeTurn.risks.risk_score}/10</span>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTurn?.generalFinance ? (
              <div className="rounded-xl border border-[#162234] bg-[#09101b] p-3 space-y-2 text-xs">
                <div className="text-emerald-400 font-semibold font-mono text-[10px] uppercase">Financial Synthesis</div>
                <p className="text-text-muted leading-relaxed">{activeTurn.generalFinance.answer}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#162234] bg-[#09101b] p-4 text-center">
                <p className="text-xs text-text-muted">
                  Specialist agent verdicts will appear here as analysis completes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-80 shrink-0 xl:block h-full">
        {content}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 right-0 w-80 z-50 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
