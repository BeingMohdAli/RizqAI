"use client";

import Link from "next/link";
import type { ConversationListItem } from "@/lib/types";
import { timeAgo } from "@/lib/format";

interface WorkspaceSidebarProps {
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewAnalysis: () => void;
  onDelete?: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function WorkspaceSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewAnalysis,
  onDelete,
  isOpenMobile,
  onCloseMobile,
}: WorkspaceSidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-[#070c14] border-r border-[#152030] text-text select-none">
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* Brand Header */}
        <div className="pt-1">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/20 transition-transform group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Rizq<span className="text-emerald-400">AI</span>
              </span>
              <p className="text-[10px] text-text-faint tracking-tight -mt-0.5">
                Smarter Research. Better Decisions.
              </p>
            </div>
          </Link>
        </div>

        {/* New Chat Primary Button */}
        <button
          onClick={onNewAnalysis}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 px-4 text-xs font-semibold text-[#070c14] shadow-md shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="12" y1="8" x2="12" y2="14" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
          New Chat
        </button>

        {/* Primary Navigation Items */}
        <div className="space-y-1 text-xs font-medium">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted hover:bg-[#0e1726] hover:text-white transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Research History
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted hover:bg-[#0e1726] hover:text-white transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Watchlist
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-muted hover:bg-[#0e1726] hover:text-white transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Saved Reports
          </button>
        </div>

        {/* Section: RECENT CHATS */}
        <div className="pt-2">
          <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Recent Chats
          </div>
          <div className="space-y-1">
            {conversations.length > 0 ? (
              conversations.map((c) => {
                const active = c.id === activeConversationId;
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-colors text-xs ${
                      active
                        ? "bg-[#111c2e] text-emerald-400 font-medium border border-emerald-500/20"
                        : "text-text-muted hover:bg-[#0e1726] hover:text-white"
                    }`}
                  >
                    <button
                      onClick={() => onSelect(c.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <span className="text-text-faint">💬</span>
                      <div className="min-w-0 flex-1 truncate">
                        <div className="truncate leading-tight">{c.title}</div>
                        <div className="text-[10px] text-text-faint font-mono">{timeAgo(c.updated_at)}</div>
                      </div>
                    </button>
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-faint hover:text-rose-400 transition-opacity ml-1"
                        title="Delete chat"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="px-3 py-2 text-[11px] text-text-faint">
                No chats yet. Start a new one above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Promotion Card */}
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-gradient-to-b from-[#0b1424] to-[#070d18] p-3.5 space-y-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-white leading-tight">
            Smarter decisions with real-time insights
          </h5>
          <p className="text-[11px] text-text-faint leading-normal mt-1">
            Get detailed equity research, risk analysis and more — powered by AI agents.
          </p>
        </div>
        <Link
          href="/#how-it-works"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pt-1"
        >
          Learn More <span>→</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Column */}
      <aside className="hidden w-64 shrink-0 lg:block h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
