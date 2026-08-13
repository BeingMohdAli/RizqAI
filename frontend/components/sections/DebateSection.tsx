import type { DebateAgentState } from "@/lib/types";
import Markdown from "../Markdown";

export default function DebateSection({ debate }: { debate: DebateAgentState }) {
  return (
    <div className="animate-rise-in space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-bull/25 bg-bull-soft p-4">
          <div className="mb-2 font-display text-sm italic tracking-wide text-bull">
            The bull case
          </div>
          <Markdown content={debate.bull_case.summary} className="mb-3 text-sm leading-relaxed text-text" />
          <ul className="space-y-1.5">
            {debate.bull_case.arguments.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bull" />
                <Markdown content={a} inline />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-bear/25 bg-bear-soft p-4">
          <div className="mb-2 font-display text-sm italic tracking-wide text-bear">
            The bear case
          </div>
          <Markdown content={debate.bear_case.summary} className="mb-3 text-sm leading-relaxed text-text" />
          <ul className="space-y-1.5">
            {debate.bear_case.arguments.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bear" />
                <Markdown content={a} inline />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {debate.key_conflicts.length > 0 && (
        <div className="rounded-lg border border-line-soft bg-ink-raised/60 p-3">
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
            Where they clash
          </div>
          <ul className="space-y-1">
            {debate.key_conflicts.map((c, i) => (
              <li key={i} className="text-sm leading-snug text-text-muted">
                <Markdown content={c} inline />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}