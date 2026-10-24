export default function FeaturesSection() {
  const features = [
    {
      title: "Real-Time Market Data",
      description: "Live prices, key financials, technical indicators and more.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      accentColor: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Multi-Agent Analysis",
      description: "Specialized agents work together for deeper, unbiased research.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      accentColor: "border-teal-500/25 bg-teal-500/10 text-teal-400",
    },
    {
      title: "Bull vs Bear Debate",
      description: "Adversarial analysis to surface opposing viewpoints and risks.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
      ),
      accentColor: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    },
    {
      title: "Risk Scoring Engine",
      description: "Understand downside, volatility and risk factors with clear scoring.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      accentColor: "border-cyan-500/25 bg-cyan-500/10 text-cyan-400",
    },
    {
      title: "Source-Linked Insights",
      description: "Every claim is backed by real sources and live financial data.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      accentColor: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Streaming Results",
      description: "Get live updates and track agent progress with real-time streaming.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      accentColor: "border-teal-400/25 bg-teal-400/10 text-teal-300",
    },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column Heading */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Key Features
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Everything You Need for Smarter Financial Decisions
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed pt-2">
              RizqAI combines real-time data, advanced AI agents, and structured
              analysis to give you institutional-grade insights — instantly and
              transparently.
            </p>
          </div>

          {/* Right Column Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-line-soft bg-surface/60 p-6 transition-all hover:border-emerald-500/30 hover:bg-surface/90 hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border mb-4 transition-transform group-hover:scale-105 ${feature.accentColor}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

