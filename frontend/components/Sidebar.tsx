"use client";

import { useEffect, useState } from "react";
import { getConversations, type ConversationListItem } from "@/lib/api";

interface SidebarProps {
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  refreshKey: number;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function Sidebar({
  activeConversationId,
  onSelect,
  onNewChat,
  refreshKey,
}: SidebarProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getConversations()
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load chats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-line-soft bg-ink/60 px-3 py-4">
      <div className="mb-4 flex items-baseline gap-2 px-1">
        <span className="font-display text-base font-semibold tracking-tight text-text">
          Rizq<span className="text-gold">AI</span>
        </span>
      </div>

      <button
        onClick={onNewChat}
        className="mb-4 rounded-lg border border-line-soft px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-white/5"
      >
        + New chat
      </button>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {loading && <p className="px-2 text-xs text-text-faint">Loading…</p>}

        {!loading && error && (
          <p className="px-2 text-xs text-red-400">{error}</p>
        )}

        {!loading && !error && conversations.length === 0 && (
          <p className="px-2 text-xs text-text-faint">No conversations yet.</p>
        )}

        {!loading &&
          !error &&
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-md px-2 py-2 text-left text-sm transition ${
                c.id === activeConversationId
                  ? "bg-white/10 text-text"
                  : "text-text-muted hover:bg-white/5"
              }`}
              title={c.title}
            >
              <div className="truncate">{c.title}</div>
              <div className="text-[11px] text-text-faint">
                {formatRelativeTime(c.updated_at)}
              </div>
            </button>
          ))}
      </div>
    </aside>
  );
}