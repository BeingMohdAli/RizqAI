"use client";

import { useState } from "react";
import type { StreamLogEntry } from "@/lib/types";

const NODE_LABEL: Record<string, string> = {
  guardrail_agent: "guardrail",
  planner_agent: "planner",
  research_agent: "research",
  risk_agent: "risk",
  debate_agent: "debate",
  thesis_agent: "thesis",
  general_finance_agent: "gen. finance",
  done: "stream",
  error: "stream",
};

function StatusGlyph({ success }: { success: boolean | null }) {
  if (success === true) return <span className="text-bull">✓</span>;
  if (success === false) return <span className="text-bear">✗</span>;
  return <span className="text-text-faint">•</span>;
}

/**
 * Raw, chronological view of every SSE event a turn received — which node
 * fired, in what order, and whether it succeeded. Sits underneath the polite
 * Timeline dots for anyone who wants to see the actual graph execution
 * (e.g. while debugging a stuck or failing agent) instead of just a single
 * "working…" label.
 */
export default function StreamLog({
  events,
  isStreaming,
}: {
  events: StreamLogEntry[];
  isStreaming: boolean;
}) {
  const [open, setOpen] = useState(isStreaming);

  if (events.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint transition-colors hover:text-gold"
      >
        {open ? "Hide" : "Show"} the flow ({events.length})
      </button>

      {open && (
        <div className="mt-2 space-y-1 rounded-lg border border-line-soft bg-ink-raised/80 p-3 font-mono text-[12px]">
          {events.map((e) => (
            <div key={e.id} className="flex gap-2 leading-snug">
              <span className="shrink-0">
                <StatusGlyph success={e.success} />
              </span>
              <span className="shrink-0 text-text-faint">
                {new Date(e.timestamp).toLocaleTimeString(undefined, { hour12: false })}
              </span>
              <span className="shrink-0 text-gold">{NODE_LABEL[e.node] ?? e.node}</span>
              <span className="min-w-0 flex-1 text-text-muted">{e.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}