export default function ScopeNoteSection({ reason }: { reason: string }) {
  return (
    <div className="animate-rise-in rounded-lg border border-line-soft bg-ink-raised/60 px-4 py-3">
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
        Outside the desk
      </div>
      <p className="text-sm leading-relaxed text-text-muted">{reason}</p>
    </div>
  );
}