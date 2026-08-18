"use client";

import { useState } from "react";
import type { ResearchData, ToolOutputDict } from "@/lib/types";
import { formatCompactNumber, formatPrice, timeAgo, titleCase } from "@/lib/format";
import Markdown from "../Markdown";

const STAT_FIELDS: { key: string; label: string; kind: "price" | "compact" | "raw" }[] = [
  { key: "price", label: "Price", kind: "price" },
  { key: "market_cap", label: "Market Cap", kind: "compact" },
  { key: "pe_ratio", label: "P/E", kind: "raw" },
  { key: "forward_pe", label: "Fwd P/E", kind: "raw" },
  { key: "dividend_yield", label: "Div Yield", kind: "raw" },
  { key: "52_week_high", label: "52w High", kind: "price" },
  { key: "52_week_low", label: "52w Low", kind: "price" },
];

function isNewsList(output: unknown): output is { title?: string; source?: string; url?: string; published_at?: string }[] {
  return Array.isArray(output) && output.length > 0 && typeof output[0] === "object" && output[0] !== null && "title" in output[0];
}

function isStockSnapshot(output: unknown): output is Record<string, unknown> {
  if (typeof output !== "object" || output === null || Array.isArray(output)) return false;
  return STAT_FIELDS.some((f) => f.key in output);
}

function ToolResult({ entry }: { entry: ToolOutputDict }) {
  const symbol =
    typeof entry.tool_input?.symbol === "string" ? entry.tool_input.symbol : undefined;

  if (isStockSnapshot(entry.output)) {
    const data = entry.output;
    const currency = data.currency;
    const stats = STAT_FIELDS.map((f) => {
      const raw = data[f.key];
      if (raw === null || raw === undefined) return null;
      let display: string | null;
      if (f.kind === "price") display = formatPrice(raw, currency);
      else if (f.kind === "compact") display = formatCompactNumber(raw);
      else display = typeof raw === "number" ? raw.toFixed(2) : String(raw);
      if (!display) return null;
      return { label: f.label, display };
    }).filter((s): s is { label: string; display: string } => s !== null);

    if (stats.length === 0) return null;

    return (
      <div className="rounded-lg border border-line-soft bg-ink-raised/60 p-3">
        {symbol && (
          <div className="mb-2 font-mono text-xs font-semibold text-gold">{symbol}</div>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
                {s.label}
              </div>
              <div className="font-mono text-sm text-text">{s.display}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isNewsList(entry.output)) {
    return (
      <div className="rounded-lg border border-line-soft bg-ink-raised/60 p-3">
        {symbol && (
          <div className="mb-2 font-mono text-xs font-semibold text-gold">{symbol} news</div>
        )}
        <ul className="space-y-2">
          {entry.output.slice(0, 5).map((article, i) => (
            <li key={i} className="text-sm leading-snug">
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text hover:text-gold hover:underline underline-offset-2"
                >
                  {article.title}
                </a>
              ) : (
                <span className="text-text">{article.title}</span>
              )}
              <span className="ml-1.5 font-mono text-[11px] text-text-faint">
                {article.source}
                {timeAgo(article.published_at) ? ` · ${timeAgo(article.published_at)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line-soft bg-ink-raised/60 p-3">
      <div className="mb-1 font-mono text-xs font-semibold text-gold">
        {titleCase(entry.tool)}
        {symbol ? ` · ${symbol}` : ""}
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-text-muted">
        {JSON.stringify(entry.output, null, 2)}
      </pre>
    </div>
  );
}

export default function ResearchSection({ research }: { research: ResearchData }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="animate-rise-in space-y-3">
      <Markdown content={research.summary} className="text-[15px] leading-relaxed text-text" />

      {research.tool_data.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint transition-colors hover:text-gold"
          >
            {expanded ? "Hide" : "Show"} sourced data ({research.tool_data.length})
          </button>
          {expanded && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {research.tool_data.map((entry, i) => (
                <ToolResult key={i} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}