import type { AgentTask, AnalysisTurn } from "@/lib/types";
import { AGENT_STEPS } from "@/lib/types";
import Timeline from "./Timeline";
import PlanSection from "./sections/PlanSection";
import ResearchSection from "./sections/ResearchSection";
import RiskSection from "./sections/RiskSection";
import DebateSection from "./sections/DebateSection";
import ThesisSection from "./sections/ThesisSection";

const WORKING_COPY: Record<AgentTask, string> = {
  research_agent: "Research desk is pulling price, fundamentals, and news…",
  risk_agent: "Risk desk is weighing the downside…",
  debate_agent: "Bull and bear desks are making their case…",
  thesis_agent: "Drafting the verdict…",
};

function getActiveStep(turn: AnalysisTurn): AgentTask | null {
  if (turn.status !== "streaming" || !turn.plan) return null;
  return (
    turn.plan.tasks.find((t) => !turn.completedTasks.includes(t)) ?? null
  );
}

function WorkingSkeleton({ label }: { label: string }) {
  return (
    <div className="animate-rise-in flex items-center gap-3">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold animate-pulse-dot" />
      <span className="text-sm text-text-faint">{label}</span>
      <span className="h-3 flex-1 max-w-40 rounded animate-shimmer" />
    </div>
  );
}

const SECTION_LABELS: Record<AgentTask, string> = {
  research_agent: "Research",
  risk_agent: "Risk",
  debate_agent: "Debate",
  thesis_agent: "Verdict",
};

export default function ChatTurn({ turn }: { turn: AnalysisTurn }) {
  const activeStep = getActiveStep(turn);

  return (
    <div className="space-y-3">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-gold/25 bg-gold-soft px-4 py-2.5 text-[15px] text-text sm:max-w-[70%]">
          {turn.query}
        </div>
      </div>

      {/* Assistant memo */}
      <div className="animate-rise-in rounded-2xl rounded-tl-sm border border-line bg-surface/70 p-5 backdrop-blur-sm sm:p-6">
        <div className="mb-4">
          <Timeline turn={turn} />
        </div>

        <div className="space-y-5">
          {!turn.plan && turn.status === "streaming" && (
            <WorkingSkeleton label="Reading the question…" />
          )}

          {turn.plan && <PlanSection plan={turn.plan} />}

          {AGENT_STEPS.map((step) => {
            const isRequested = turn.plan?.tasks.includes(step.key);
            if (!isRequested) return null;

            const hasData =
              (step.key === "research_agent" && turn.research) ||
              (step.key === "risk_agent" && turn.risks) ||
              (step.key === "debate_agent" && turn.debate) ||
              (step.key === "thesis_agent" && turn.thesis);

            if (!hasData && activeStep !== step.key) return null;

            return (
              <div key={step.key}>
                <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
                  {SECTION_LABELS[step.key]}
                </div>
                {hasData ? (
                  <>
                    {step.key === "research_agent" && turn.research && (
                      <ResearchSection research={turn.research} />
                    )}
                    {step.key === "risk_agent" && turn.risks && (
                      <RiskSection risk={turn.risks} />
                    )}
                    {step.key === "debate_agent" && turn.debate && (
                      <DebateSection debate={turn.debate} />
                    )}
                    {step.key === "thesis_agent" && turn.thesis && (
                      <ThesisSection thesis={turn.thesis} />
                    )}
                  </>
                ) : (
                  <WorkingSkeleton label={WORKING_COPY[step.key]} />
                )}
              </div>
            );
          })}

          {turn.status === "error" && (
            <div className="animate-rise-in rounded-lg border border-bear/30 bg-bear-soft px-4 py-3 text-sm text-bear">
              The desk hit a snag: {turn.error ?? "unknown error"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}