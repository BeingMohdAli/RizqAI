import { AGENT_STEPS, type AnalysisTurn } from "@/lib/types";

type StepStatus = "pending" | "active" | "done" | "error" | "skipped";

function getStatus(turn: AnalysisTurn, index: number): StepStatus {
  const step = AGENT_STEPS[index];
  const requested = turn.plan?.tasks.includes(step.key) ?? true;

  if (!requested) return "skipped";
  if (turn.completedTasks.includes(step.key)) return "done";

  const allBeforeDone = AGENT_STEPS.slice(0, index).every(
    (s, i) => getStatus(turn, i) === "done" || getStatus(turn, i) === "skipped"
  );

  if (turn.status === "error" && allBeforeDone) return "error";
  if (turn.status === "streaming" && allBeforeDone) return "active";
  return "pending";
}

const DOT_STYLES: Record<StepStatus, string> = {
  pending: "border-line bg-transparent",
  active: "border-gold bg-gold animate-pulse-dot",
  done: "border-bull bg-bull",
  error: "border-bear bg-bear",
  skipped: "border-line-soft bg-transparent opacity-40",
};

const LABEL_STYLES: Record<StepStatus, string> = {
  pending: "text-text-faint",
  active: "text-gold",
  done: "text-text-muted",
  error: "text-bear",
  skipped: "text-text-faint opacity-50",
};

export default function Timeline({ turn }: { turn: AnalysisTurn }) {
  const planStatus: StepStatus = turn.plan
    ? "done"
    : turn.status === "error"
      ? "error"
      : "active";

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px] uppercase tracking-[0.12em]">
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full border ${DOT_STYLES[planStatus]}`}
        />
        <span className={LABEL_STYLES[planStatus]}>Plan</span>
      </div>

      {AGENT_STEPS.map((step, i) => {
        const status = getStatus(turn, i);
        if (status === "skipped") return null;
        return (
          <div key={step.key} className="flex shrink-0 items-center gap-1.5">
            <span className="h-px w-3 shrink-0 bg-line" />
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full border ${DOT_STYLES[status]}`}
            />
            <span className={LABEL_STYLES[status]}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}