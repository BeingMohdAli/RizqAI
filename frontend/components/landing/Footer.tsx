import Link from "next/link";

export default function Footer() {
  return (
    <footer id="about" className="border-t border-line-soft/60 bg-[#04080e] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-line-soft/40">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Rizq<span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted max-w-sm">
              Autonomous multi-agent financial intelligence and research engine. Institutional clarity powered by AI.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-8 text-xs font-medium text-text-muted">
            <a href="#home" className="hover:text-emerald-400 transition-colors">Home</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <Link href="/app" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Launch Workspace</Link>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-text-faint">
          <p className="max-w-2xl leading-relaxed">
            <span className="font-semibold text-text-muted">Disclaimer:</span> RizqAI is an AI-powered financial research assistant designed for educational and informational purposes only. Outputs do not constitute financial, investment, legal, or tax advice. Always conduct your own due diligence.
          </p>
          <div className="shrink-0">
            © {new Date().getFullYear()} RizqAI Systems. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

