import type { Recommendation, ThesisAgentState } from "@/lib/types";
import Markdown from "../Markdown";

const STAMP_COLOR: Record<Recommendation, string> = {
  BUY: "text-bull",
  WATCH: "text-gold",
  HOLD: "text-gold",
  SELL: "text-bear",
};

export default function ThesisSection({ thesis }: { thesis: ThesisAgentState }) {
  return (
    <div className="animate-rise-in space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className={`verdict-stamp ${STAMP_COLOR[thesis.recommendation]}`}>
          {thesis.recommendation}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-1 rounded-full ${
                  i < thesis.confidence ? "bg-gold" : "bg-line-soft"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-text-faint">
            {thesis.confidence}/10 confidence
          </span>
        </div>
      </div>

      <div className="font-display text-lg italic leading-relaxed text-text">
        <Markdown content={`\u201C${thesis.investment_thesis}\u201D`} inline />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
            Key reasons
          </div>
          <ul className="space-y-1.5">
            {thesis.key_reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <Markdown content={r} inline />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
            Watch out for
          </div>
          <ul className="space-y-1.5">
            {thesis.potential_risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bear" />
                <Markdown content={r} inline />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {thesis.next_steps.length > 0 && (
        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
            Next steps
          </div>
          <ul className="space-y-1">
            {thesis.next_steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text">
                <span className="font-mono text-xs text-gold">{i + 1}.</span>
                <Markdown content={s} inline />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-line-soft pt-3 text-xs italic leading-relaxed text-text-faint">
        {thesis.disclaimer}
      </p>
    </div>
  );
}