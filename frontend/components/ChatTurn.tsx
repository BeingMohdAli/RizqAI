import type { AgentTask, AnalysisTurn } from "@/lib/types";
import { AGENT_STEPS } from "@/lib/types";
import Timeline from "./Timeline";
import StreamLog from "./StreamLog";
import PlanSection from "./sections/PlanSection";
import ResearchSection from "./sections/ResearchSection";
import RiskSection from "./sections/RiskSection";
import DebateSection from "./sections/DebateSection";
import ThesisSection from "./sections/ThesisSection";
import GeneralFinanceSection from "./sections/GeneralFinanceSection";
import ScopeNoteSection from "./sections/ScopeNoteSection";
import EmptyNoteSection from "./sections/EmptyNoteSection";

const WORKING_COPY: Record<AgentTask, string> = {
  research_agent: "Research desk is pulling price, fundamentals, and news…",
  risk_agent: "Risk desk is weighing the downside…",
  debate_agent: "Bull and bear desks are making their case…",
  thesis_agent: "Drafting the verdict…",
};

const SECTION_LABELS: Record<AgentTask, string> = {
  research_agent: "Research",
  risk_agent: "Risk",
  debate_agent: "Debate",
  thesis_agent: "Verdict",
};

type Phase =
  | "screening"
  | "irrelevant"
  | "general-finance-pending"
  | "general-finance"
  | "company-analysis-pending"
  | "company-analysis"
  | "empty";

function getPhase(turn: AnalysisTurn): Phase {
  if (turn.generalFinance) return "general-finance";
  if (turn.plan) return "company-analysis";
  if (turn.guardrail?.category === "irrelevant") return "irrelevant";
  if (turn.status === "streaming") {
    if (!turn.guardrail) return "screening";
    if (turn.guardrail.category === "general_finance") return "general-finance-pending";
    return "company-analysis-pending";
  }
  return turn.fromHistory ? "empty" : "screening";
}

function getActiveStep(turn: AnalysisTurn): AgentTask | null {
  if (turn.status !== "streaming" || !turn.plan) return null;
  return turn.plan.tasks.find((t) => !turn.completedTasks.includes(t)) ?? null;
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

function CompanyAnalysisBody({ turn }: { turn: AnalysisTurn }) {
  const activeStep = getActiveStep(turn);
  if (!turn.plan) return null;

  return (
    <>
      <PlanSection plan={turn.plan} />
      {AGENT_STEPS.map((step) => {
        if (!turn.plan!.tasks.includes(step.key)) return null;

        const dataByStep: Record<AgentTask, unknown> = {
          research_agent: turn.research,
          risk_agent: turn.risks,
          debate_agent: turn.debate,
          thesis_agent: turn.thesis,
        };
        const hasData = dataByStep[step.key] !== null;
        if (!hasData && activeStep !== step.key) return null;

        return (
          <div key={step.key}>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
              {SECTION_LABELS[step.key]}
            </div>
            {hasData ? (
              <>
                {step.key === "research_agent" && turn.research && <ResearchSection research={turn.research} />}
                {step.key === "risk_agent" && turn.risks && <RiskSection risk={turn.risks} />}
                {step.key === "debate_agent" && turn.debate && <DebateSection debate={turn.debate} />}
                {step.key === "thesis_agent" && turn.thesis && <ThesisSection thesis={turn.thesis} />}
              </>
            ) : (
              <WorkingSkeleton label={WORKING_COPY[step.key]} />
            )}
          </div>
        );
      })}
    </>
  );
}

export default function ChatTurn({ turn }: { turn: AnalysisTurn }) {
  const phase = getPhase(turn);

  return (
    <div className="space-y-3">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-gold/25 bg-gold-soft px-4 py-2.5 text-[15px] text-text sm:max-w-[70%]">
          {turn.query}
        </div>
      </div>

      {/* Assistant memo */}
      <div className="animate-rise-in overflow-hidden rounded-2xl rounded-tl-sm border border-line bg-surface/70 p-5 backdrop-blur-sm sm:p-6">
        <div className="mb-4">
          <Timeline turn={turn} />
        </div>

        <StreamLog events={turn.events} isStreaming={turn.status === "streaming"} />

        <div className="space-y-5">
          {phase === "screening" && <WorkingSkeleton label="Reading the question…" />}
          {phase === "company-analysis-pending" && <WorkingSkeleton label="Drafting the game plan…" />}
          {phase === "general-finance-pending" && <WorkingSkeleton label="Consulting the desk's notes…" />}
          {phase === "irrelevant" && turn.guardrail && <ScopeNoteSection reason={turn.guardrail.reason} />}
          {phase === "general-finance" && turn.generalFinance && <GeneralFinanceSection answer={turn.generalFinance} />}
          {phase === "company-analysis" && <CompanyAnalysisBody turn={turn} />}
          {phase === "empty" && <EmptyNoteSection />}

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