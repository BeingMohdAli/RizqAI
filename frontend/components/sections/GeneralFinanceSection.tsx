import type { GeneralFinanceAnswer } from "@/lib/types";
import Markdown from "../Markdown";

const MODE_LABEL: Record<GeneralFinanceAnswer["mode"], string> = {
  conceptual: "Concept note",
  memory_followup: "From your file",
};

export default function GeneralFinanceSection({ answer }: { answer: GeneralFinanceAnswer }) {
  return (
    <div className="animate-rise-in space-y-3">
      <span className="rounded-full border border-gold/40 bg-gold-soft px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-gold">
        {MODE_LABEL[answer.mode]}
      </span>

      <Markdown content={answer.answer} className="text-[15px] leading-relaxed text-text" />

      {answer.key_points.length > 0 && (
        <ul className="space-y-1.5">
          {answer.key_points.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm leading-snug text-text-muted">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <Markdown content={point} inline />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}