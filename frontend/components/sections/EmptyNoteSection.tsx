// Shown for reloaded history where no assistant messages were persisted for
// a query — either the guardrail marked it out of scope (its reason isn't
// stored, only live guardrail_agent events carry it — see ScopeNoteSection)
// or the run failed before any agent produced output.
export default function EmptyNoteSection() {
  return (
    <div className="animate-rise-in rounded-lg border border-line-soft bg-ink-raised/60 px-4 py-3">
      <p className="text-sm leading-relaxed text-text-faint">
        No analysis was recorded for this query.
      </p>
    </div>
  );
}