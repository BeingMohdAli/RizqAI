"use client";

import { useState } from "react";
import type { AnalysisTurn } from "@/lib/types";

interface WorkspaceRightPanelProps {
  activeTurn?: AnalysisTurn | null;
  onQuickQuery: (query: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function WorkspaceRightPanel({
  activeTurn,
  onQuickQuery,
  isOpenMobile,
  onCloseMobile,
}: WorkspaceRightPanelProps) {
  const [activeTab, setActiveTab] = useState<"Overview" | "News" | "Financials" | "Analysis">("Overview");
  const [isStarred, setIsStarred] = useState(true);

  // Extract dynamic company info from activeTurn if available
  const planCompany = activeTurn?.plan?.companies?.[0];
  const researchData = activeTurn?.research;

  // Defaults matching the screenshot
  let companyName = "Tesla (TSLA)";
  let exchangePrice = "NASDAQ · $248.50 +2.36%";
  let description =
    "Tesla, Inc. designs, manufactures and sells electric vehicles, energy generation and storage systems, and other related products and services.";
  let marketCap = "$795.4B";
  let peRatio = "65.3";
  let fiftyTwoHigh = "$488.5";
  let fiftyTwoLow = "$138.8";
  let dividendYield = "0.00%";
  let beta = "2.32";
  let symbolIcon = "T";
  let symbolColor = "bg-red-600";

  // If research agent returned real tool data for a stock, populate dynamically!
  if (researchData && researchData.tool_data) {
    for (const step of researchData.tool_data) {
      if (step.tool === "get_company_info" && typeof step.output === "object" && step.output !== null) {
        const info = step.output as Record<string, unknown>;
        if (info.name) companyName = `${info.name} (${info.symbol || planCompany || ""})`;
        if (info.summary) description = String(info.summary).slice(0, 200) + "...";
        if (info.market_cap) marketCap = `$${(Number(info.market_cap) / 1e9).toFixed(1)}B`;
        if (info.pe_ratio) peRatio = String(info.pe_ratio);
        if (info.fiftyTwoWeekHigh || info["52_week_high"]) fiftyTwoHigh = `$${info.fiftyTwoWeekHigh || info["52_week_high"]}`;
        if (info.fiftyTwoWeekLow || info["52_week_low"]) fiftyTwoLow = `$${info.fiftyTwoWeekLow || info["52_week_low"]}`;
        if (info.dividend_yield) dividendYield = `${(Number(info.dividend_yield) * 100).toFixed(2)}%`;
        if (info.beta) beta = String(info.beta);
      }
      if (step.tool === "get_stock_price" && typeof step.output === "object" && step.output !== null) {
        const quote = step.output as Record<string, unknown>;
        if (quote.price) {
          exchangePrice = `${quote.currency || "USD"} · $${quote.price} +1.8%`;
        }
      }
    }
    if (planCompany) {
      symbolIcon = planCompany.slice(0, 1).toUpperCase();
      symbolColor = "bg-emerald-600";
    }
  } else if (planCompany) {
    companyName = `${planCompany.toUpperCase()}`;
    symbolIcon = planCompany.slice(0, 1).toUpperCase();
  }

  const newsItems = [
    {
      title: "Tesla reports higher-than-expected Q1 revenue, shares rise",
      time: "2h ago · Reuters",
      icon: "⚡",
    },
    {
      title: "Analysts remain divided on Tesla's near-term outlook",
      time: "4h ago · MarketWatch",
      icon: "🚗",
    },
    {
      title: "New AI chip could accelerate Tesla's autonomous driving plans",
      time: "6h ago · Bloomberg",
      icon: "🧠",
    },
  ];

  const relatedQueries = [
    `${planCompany || "Tesla"} competitors`,
    "EV market outlook",
    `${planCompany || "Tesla"} stock forecast`,
    "Elon Musk latest news",
  ];

  const content = (
    <div className="flex h-full flex-col justify-between p-4 bg-[#070c14] border-l border-[#152030] text-text overflow-y-auto select-none">
      <div className="space-y-4">
        {/* Top Header: Live Market Data indicator & User Avatar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#152030]/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs font-mono font-medium text-text-muted">Live Market Data</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 text-xs font-bold text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
              M
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#152030] pb-1 text-xs">
          {(["Overview", "News", "Financials", "Analysis"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-emerald-400 text-emerald-400 font-semibold"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Company Card */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-sm shadow-sm ${symbolColor}`}
              >
                {symbolIcon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{companyName}</h4>
                <p className="text-[11px] font-mono text-emerald-400 font-medium">{exchangePrice}</p>
              </div>
            </div>

            <button
              onClick={() => setIsStarred(!isStarred)}
              className="text-amber-400 hover:scale-110 transition-transform"
              title="Toggle Watchlist"
            >
              {isStarred ? "★" : "☆"}
            </button>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Key Stats Table */}
        <div className="rounded-xl border border-[#152030] bg-[#09101b] p-3 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint pb-1 border-b border-[#152030]/60">
            Key Stats
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <span>🏢</span> Market Cap
              </span>
              <span className="text-white font-semibold">{marketCap}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <span>📊</span> P/E Ratio
              </span>
              <span className="text-white font-semibold">{peRatio}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <span>📈</span> 52W High
              </span>
              <span className="text-white font-semibold">{fiftyTwoHigh}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <span>📉</span> 52W Low
              </span>
              <span className="text-white font-semibold">{fiftyTwoLow}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <span>💰</span> Dividend Yield
              </span>
              <span className="text-white font-semibold">{dividendYield}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5">
                <span>🎯</span> Beta
              </span>
              <span className="text-white font-semibold">{beta}</span>
            </div>
          </div>
        </div>

        {/* Recent News Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              Recent News
            </span>
            <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono">
              View all
            </button>
          </div>

          <div className="space-y-2">
            {newsItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-[#152030] bg-[#09101b] p-2.5 hover:border-emerald-500/25 transition-colors cursor-pointer group"
                onClick={() => onQuickQuery(`What is the impact of: ${item.title}`)}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#101928] text-xs">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-text group-hover:text-emerald-300 leading-snug line-clamp-2">
                    {item.title}
                  </p>
                  <span className="text-[10px] font-mono text-text-faint mt-1 block">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Queries Section */}
        <div className="space-y-2 pt-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Related Queries
          </div>

          <div className="flex flex-wrap gap-1.5">
            {relatedQueries.map((query) => (
              <button
                key={query}
                onClick={() => onQuickQuery(query)}
                className="rounded-lg border border-[#152030] bg-[#09101b] px-2.5 py-1 text-[11px] text-text-muted hover:border-emerald-500/30 hover:text-emerald-300 hover:bg-[#0e1728] transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Column */}
      <aside className="hidden w-80 shrink-0 xl:block h-full">
        {content}
      </aside>

      {/* Mobile Drawer */}
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

