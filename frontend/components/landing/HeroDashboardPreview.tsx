"use client";

export default function HeroDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 opacity-70 blur-2xl" />

      {/* 3D Tilted Glass Container */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#080e18]/95 p-3 sm:p-5 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl lg:rotate-1 lg:hover:rotate-0 transition-transform duration-700 ease-out">
        {/* Top window chrome */}
        <div className="mb-4 flex items-center justify-between border-b border-line-soft/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-text-faint">rizqai-desk-session-active.internal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              Multi-Agent Engine Online
            </span>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left Mini Sidebar */}
          <div className="hidden lg:col-span-2 lg:flex lg:flex-col justify-between border-r border-line-soft/60 pr-3">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-medium text-xs">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                  ⚡
                </div>
                RizqAI
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 font-medium text-emerald-300">
                  <span>+</span> New Chat
                </div>
                <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-muted">
                  <span>💬</span> Recent Chats
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-[10px] text-emerald-400">
              <div className="font-semibold text-white">Institutional Mode</div>
              <div>6 Specialist Agents Ready</div>
            </div>
          </div>

          {/* Center Main Stage */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header Greeting & Mock Search */}
            <div className="rounded-xl border border-line-soft/80 bg-ink-raised/70 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">Good evening, Mohd Ali</h4>
                  <p className="text-[11px] text-text-muted">Ask me anything about stocks, markets, or financial concepts.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-[#070b12] px-3 py-1.5 text-xs text-text-muted">
                <span className="text-emerald-400">🔍</span>
                <span className="flex-1 text-text-muted truncate">Analyze Apple (AAPL) - valuation, bull vs bear, and final verdict</span>
                <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-ink">⏎</span>
              </div>
            </div>

            {/* AAPL Financial Snapshot Card */}
            <div className="rounded-xl border border-line-soft bg-surface/80 p-4 space-y-3">
              {/* Ticker Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-ink text-white font-bold">
                    
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">AAPL</h3>
                      <span className="text-xs text-text-faint">Apple Inc.</span>
                      <span className="rounded bg-line-soft px-1.5 py-0.5 text-[9px] text-text-muted">Technology</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-bold text-white tracking-tight">$248.50</span>
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        +2.36%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Chart Line */}
                <div className="w-28 sm:w-36 h-10">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,35 Q20,38 35,22 T65,18 T100,6 L100,40 L0,40 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0,35 Q20,38 35,22 T65,18 T100,6"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-4 border-b border-line-soft/60 pb-1.5 text-[11px] font-medium text-text-muted">
                <span className="text-emerald-400 border-b-2 border-emerald-400 pb-1 font-semibold">Overview</span>
                <span className="hover:text-text cursor-pointer">News</span>
                <span className="hover:text-text cursor-pointer">Financials</span>
                <span className="hover:text-text cursor-pointer">Multi-Agent Analysis</span>
              </div>

              {/* Key Fundamentals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="rounded-lg bg-ink/70 p-2 border border-line-soft/50">
                  <div className="text-[10px] text-text-faint">Market Cap</div>
                  <div className="text-xs font-semibold text-white">$795.4B</div>
                </div>
                <div className="rounded-lg bg-ink/70 p-2 border border-line-soft/50">
                  <div className="text-[10px] text-text-faint">P/E Ratio</div>
                  <div className="text-xs font-semibold text-white">65.3</div>
                </div>
                <div className="rounded-lg bg-ink/70 p-2 border border-line-soft/50">
                  <div className="text-[10px] text-text-faint">52W Range</div>
                  <div className="text-xs font-semibold text-white">$138.8 - $408.5</div>
                </div>
                <div className="rounded-lg bg-ink/70 p-2 border border-line-soft/50">
                  <div className="text-[10px] text-text-faint">Dividend Yield</div>
                  <div className="text-xs font-semibold text-white">0.52%</div>
                </div>
              </div>

              {/* Multi-Agent Synthesis Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {/* Bull Case */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-1">
                    <span>🟢</span> Bull Case
                  </div>
                  <p className="text-[11px] leading-snug text-emerald-100/90">
                    Strong product pipeline, growing services margin, and generative AI ecosystem expansion.
                  </p>
                </div>

                {/* Bear Case */}
                <div className="rounded-lg border border-bear/25 bg-bear-soft/30 p-2.5">
                  <div className="flex items-center gap-1.5 text-bear font-semibold text-[11px] mb-1">
                    <span>🔴</span> Bear Case
                  </div>
                  <p className="text-[11px] leading-snug text-rose-100/90">
                    High valuation multiple, China market headwind risks, and antitrust regulatory scrutiny.
                  </p>
                </div>

                {/* Thesis / Verdict */}
                <div className="rounded-lg border border-gold/30 bg-gold-soft/20 p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gold font-semibold mb-1">
                      <span>Investment Thesis</span>
                      <span className="font-mono text-[10px] bg-gold/15 px-1 rounded">Conf. 72%</span>
                    </div>
                    <div className="text-base font-extrabold text-white">
                      BUY <span className="text-[10px] font-normal text-text-muted">/ Long Term</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-text-faint mt-1">Multi-Agent Consensus</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Market & News Column */}
          <div className="lg:col-span-3 space-y-3">
            {/* Live Market Watch */}
            <div className="rounded-xl border border-line-soft bg-surface/70 p-3 space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-text-faint uppercase tracking-wider pb-1 border-b border-line-soft/50">
                <span>Live Market Data</span>
                <span className="text-emerald-400">● Live</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Apple (AAPL)</span>
                  <span className="text-emerald-400 font-semibold">248.50 +2.36%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Tesla (TSLA)</span>
                  <span className="text-emerald-400 font-semibold">795.40 +1.24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Microsoft (MSFT)</span>
                  <span className="text-emerald-400 font-semibold">420.17 +0.86%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">NVIDIA (NVDA)</span>
                  <span className="text-emerald-400 font-semibold">135.62 +2.17%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Amazon (AMZN)</span>
                  <span className="text-emerald-400 font-semibold">178.24 +1.32%</span>
                </div>
              </div>
            </div>

            {/* Recent Verified News */}
            <div className="rounded-xl border border-line-soft bg-surface/70 p-3 space-y-2">
              <div className="font-mono text-[11px] text-text-faint uppercase tracking-wider pb-1 border-b border-line-soft/50">
                Recent Catalyst News
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="rounded bg-ink/50 p-1.5 border border-line-soft/40">
                  <p className="text-text font-medium leading-snug">Apple unveils new AI features at WWDC conference</p>
                  <span className="text-[10px] text-text-faint">2h ago · Reuters</span>
                </div>
                <div className="rounded bg-ink/50 p-1.5 border border-line-soft/40">
                  <p className="text-text font-medium leading-snug">Tesla reports higher-than-expected Q1 revenue</p>
                  <span className="text-[10px] text-text-faint">4h ago · Bloomberg</span>
                </div>
                <div className="rounded bg-ink/50 p-1.5 border border-line-soft/40">
                  <p className="text-text font-medium leading-snug">Markets rally as core inflation cools down</p>
                  <span className="text-[10px] text-text-faint">6h ago · CNBC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
