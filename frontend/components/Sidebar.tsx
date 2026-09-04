"use client";

import type { ConversationListItem } from "@/lib/types";
import { timeAgo } from "@/lib/format";

const STATUS_COPY: Record<"checking" | "open" | "closed", { label: string; dot: string }> = {
  checking: { label: "Connecting…", dot: "bg-text-faint" },
  open: { label: "Desk open", dot: "bg-bull animate-pulse-dot" },
  closed: { label: "Desk unreachable", dot: "bg-bear" },
};

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewAnalysis,
  status,
  isOpenMobile,
  onCloseMobile,
}: {
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewAnalysis: () => void;
  status: "checking" | "open" | "closed";
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}) {
  const statusInfo = STATUS_COPY[status];

  const body = (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-soft px-4 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-text">
            Rizq<span className="text-gold">AI</span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
            the desk
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusInfo.dot}`} />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-faint">
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={onNewAnalysis}
          className="w-full rounded-xl border border-gold/30 bg-gold-soft px-3 py-2.5 text-left font-mono text-sm font-medium text-gold transition-colors hover:border-gold/50"
        >
          + New analysis
        </button>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto px-2 pb-4">
        <div className="px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
          The ledger
        </div>

        {conversations.length === 0 ? (
          <p className="px-2 py-3 text-sm leading-relaxed text-text-faint">
            No positions opened yet. Ask about a stock to start one.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const active = c.id === activeConversationId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className={`flex w-full items-baseline justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      active
                        ? "bg-surface-raised text-text"
                        : "text-text-muted hover:bg-surface hover:text-text"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] leading-snug">{c.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-text-faint">
                      {timeAgo(c.updated_at)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static column */}
      <aside className="hidden w-72 shrink-0 border-r border-line-soft bg-ink-raised/60 lg:block">
        {body}
      </aside>

      {/* Mobile: slide-over drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />
          <aside className="animate-rise-in absolute inset-y-0 left-0 w-72 border-r border-line-soft bg-ink-raised">
            {body}
          </aside>
        </div>
      )}
    </>
  );
}