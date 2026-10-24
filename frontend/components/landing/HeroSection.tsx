"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import HeroDashboardPreview from "./HeroDashboardPreview";

export default function HeroSection() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const handleStartResearching = () => {
    if (user) {
      router.push("/app");
    } else {
      openAuthModal("signup");
    }
  };

  const handleScrollToWorkflow = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 -top-40 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400 shadow-sm shadow-emerald-500/10 mb-8 backdrop-blur-md">
          <span className="text-emerald-400">⚡</span>
          <span>AI-Powered Financial Intelligence</span>
        </div>

        {/* Main Title */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          Smarter Research. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Better Investment Decisions.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-text-muted leading-relaxed">
          RizqAI is an autonomous, multi-agent financial intelligence and
          investment research engine. Get deep market insights, real-time data,
          and balanced analysis — powered by AI, not bias.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartResearching}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-ink shadow-lg shadow-emerald-400/25 transition-all hover:bg-emerald-300 hover:scale-105 active:scale-100"
          >
            Start Researching
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleScrollToWorkflow}
            className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-surface/70 px-6 py-3 text-sm font-medium text-text transition-all hover:border-emerald-500/40 hover:bg-surface hover:text-emerald-400"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Watch Demo
          </button>
        </div>

        {/* Capabilities Pill Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-mono text-text-muted">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-ink/60 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="text-emerald-400">📈</span> Real-time Market Data
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-ink/60 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="text-emerald-400">⬡</span> Multi-Agent Analysis
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-ink/60 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="text-emerald-400">⚖️</span> Adversarial Bull vs Bear
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-ink/60 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="text-emerald-400">📋</span> Structured Insights
          </div>
        </div>

        {/* Hero 3D Mockup Container */}
        <div className="mt-14 sm:mt-16">
          <HeroDashboardPreview />
        </div>
      </div>
    </section>
  );
}

