import { AGENT_STEPS, type AnalysisTurn } from "@/lib/types";

type StepStatus = "pending" | "active" | "done" | "error" | "skipped";

interface Step {
  key: string;
  label: string;
  status: StepStatus;
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

/**
 * Every turn passes through guardrail_agent first, which is why "Screen"
 * always leads. What comes after depends on the guardrail's category:
 * irrelevant -> nothing more; general_finance -> a single answer step;
 * company_analysis -> Plan, then whichever of research/risk/debate/thesis
 * the planner actually scheduled.
 */
function buildSteps(turn: AnalysisTurn): Step[] {
  const isStreaming = turn.status === "streaming";
  const isError = turn.status === "error";

  const screenStatus: StepStatus = turn.guardrail
    ? "done"
    : turn.fromHistory
      ? "done" // history can't exist without having passed the screen
      : isError
        ? "error"
        : isStreaming
          ? "active"
          : "pending";

  const steps: Step[] = [{ key: "screen", label: "Screen", status: screenStatus }];
  if (screenStatus !== "done") return steps;

  const category = turn.guardrail?.category;

  if (category === "irrelevant") return steps;

  const isGeneralFinance = category === "general_finance" || (!category && turn.generalFinance);
  if (isGeneralFinance) {
    steps.push({
      key: "answer",
      label: "Answer",
      status: turn.generalFinance ? "done" : isError ? "error" : "active",
    });
    return steps;
  }

  const isCompanyAnalysis = category === "company_analysis" || (!category && turn.plan);
  if (isCompanyAnalysis) {
    const planStatus: StepStatus = turn.plan ? "done" : isError ? "error" : "active";
    steps.push({ key: "plan", label: "Plan", status: planStatus });
    if (!turn.plan) return steps;

    let priorDone = true;
    for (const step of AGENT_STEPS) {
      if (!turn.plan.tasks.includes(step.key)) continue;
      let status: StepStatus;
      if (turn.completedTasks.includes(step.key)) status = "done";
      else if (isError && priorDone) status = "error";
      else if (isStreaming && priorDone) status = "active";
      else status = "pending";
      steps.push({ key: step.key, label: step.label, status });
      priorDone = status === "done";
    }
  }

  return steps;
}

export default function Timeline({ turn }: { turn: AnalysisTurn }) {
  const steps = buildSteps(turn);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px] uppercase tracking-[0.12em]">
      {steps.map((step, i) => (
        <div key={step.key} className="flex shrink-0 items-center gap-1.5">
          {i > 0 && <span className="h-px w-3 shrink-0 bg-line" />}
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full border ${DOT_STYLES[step.status]}`} />
          <span className={LABEL_STYLES[step.status]}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}