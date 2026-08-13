import type { RiskState } from "@/lib/types";
import Markdown from "../Markdown";

const LEVEL_COLOR: Record<RiskState["risk_level"], string> = {
  LOW: "text-bull border-bull/40 bg-bull-soft",
  MEDIUM: "text-gold border-gold/40 bg-gold-soft",
  HIGH: "text-bear border-bear/40 bg-bear-soft",
};

function gaugeColor(score: number) {
  if (score <= 3) return "var(--bull)";
  if (score <= 6) return "var(--gold)";
  return "var(--bear)";
}

export default function RiskSection({ risk }: { risk: RiskState }) {
  return (
    <div className="animate-rise-in space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-2 w-40 overflow-hidden rounded-full bg-line-soft">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${risk.risk_score * 10}%`,
                backgroundColor: gaugeColor(risk.risk_score),
              }}
            />
          </div>
          <span className="font-mono text-sm text-text">
            {risk.risk_score}
            <span className="text-text-faint">/10</span>
          </span>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${LEVEL_COLOR[risk.risk_level]}`}
        >
          {risk.risk_level} risk
        </span>
      </div>

      <Markdown content={risk.summary} className="text-[15px] leading-relaxed text-text" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bear">
            Risk factors
          </div>
          <ul className="space-y-1.5">
            {risk.risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bear" />
                <Markdown content={r} inline />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bull">
            Mitigating factors
          </div>
          <ul className="space-y-1.5">
            {risk.mitigating_factors.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bull" />
                <Markdown content={m} inline />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}