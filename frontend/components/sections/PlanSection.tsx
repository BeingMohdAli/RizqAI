import type { PlannerState } from "@/lib/types";

export default function PlanSection({ plan }: { plan: PlannerState }) {
  if (plan.companies.length === 0) return null;

  return (
    <div className="animate-rise-in flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
        Flagged
      </span>
      {plan.companies.map((symbol) => (
        <span
          key={symbol}
          className="rounded-full border border-gold/40 bg-gold-soft px-2.5 py-0.5 font-mono text-xs font-medium text-gold"
        >
          {symbol}
        </span>
      ))}
    </div>
  );
}