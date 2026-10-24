export default function HowItWorksSection() {
  const workflowSteps = [
    {
      agent: "User Query",
      model: "Client Input",
      description: "Analyze Apple (AAPL) and give me a detailed investment recommendation.",
      icon: "👤",
      badgeColor: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },
    {
      agent: "Guardrail Agent",
      model: "Groq / GPT-OSS-20B",
      description: "Screens for intent, safety, conversation coreference, and relevance.",
      icon: "🛡️",
      badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    {
      agent: "Planner Agent",
      model: "Gemini 3.7 + Fallbacks",
      description: "Resolves tickers, checks memory cache, and builds minimal task execution plan.",
      icon: "🧭",
      badgeColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
    },
    {
      agent: "Research Agent",
      model: "yFinance + NewsAPI",
      description: "Gathers live quote data, fundamental balance metrics, and latest news catalysts.",
      icon: "📊",
      badgeColor: "border-teal-500/30 bg-teal-500/10 text-teal-400",
    },
    {
      agent: "Risk Agent",
      model: "1-10 Scoring Engine",
      description: "Quantifies volatility, valuation exposure, downside factors, and mitigations.",
      icon: "⚠️",
      badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    },
    {
      agent: "Debate Agent",
      model: "Bull vs Bear Engine",
      description: "Pits opposing investment cases against each other to uncover hidden vulnerabilities.",
      icon: "⚖️",
      badgeColor: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },
    {
      agent: "Thesis Agent",
      model: "Final Synthesis",
      description: "Issues BUY/HOLD/SELL verdict, confidence score, and clear action items.",
      icon: "🎯",
      badgeColor: "border-gold/30 bg-gold-soft text-gold",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 border-t border-line-soft/60 bg-[#060a12]/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Description */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              How It Works
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              An Intelligent, Multi-Agent Research Workflow
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed pt-2">
              From your question to a detailed investment memo, RizqAI coordinates
              a team of AI agents — each with a specialized role — to deliver
              well-researched, balanced, and actionable insights.
            </p>

            <div className="pt-6 hidden lg:block">
              <div className="rounded-2xl border border-line-soft bg-surface/40 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Deterministic Fallback Architecture
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Every node communicates over a typed StateGraph. If any specialized agent encounters API rate limits or tool anomalies, the fallback chain automatically fails over across providers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Interactive Pipeline Cards */}
          <div className="lg:col-span-7 space-y-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.agent}
                className="relative flex items-center gap-4 rounded-xl border border-line-soft bg-surface/70 p-4 transition-all hover:border-emerald-500/30 hover:bg-surface hover:translate-x-1"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line-soft bg-ink text-lg">
                  {step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white tracking-tight">
                      {step.agent}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium ${step.badgeColor}`}
                    >
                      {step.model}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate sm:text-clip">
                    {step.description}
                  </p>
                </div>

                <div className="shrink-0 font-mono text-xs font-semibold text-text-faint">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

