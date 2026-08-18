// Mirrors backend/schemas/*.py field-for-field. Keep in sync with the
// Pydantic models if the backend response shape ever changes.

export type AgentTask =
  | "research_agent"
  | "risk_agent"
  | "debate_agent"
  | "thesis_agent";

export interface PlannerState {
  companies: string[];
  tasks: AgentTask[];
}

export interface ToolOutputDict {
  tool: string;
  tool_input: Record<string, unknown>;
  output: unknown;
}

export interface ResearchData {
  summary: string;
  tool_data: ToolOutputDict[];
}

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface RiskState {
  risk_score: number; // 1-10
  risk_level: RiskLevel;
  summary: string;
  mitigating_factors: string[];
  risks: string[];
}

export interface CaseOutput {
  summary: string;
  arguments: string[];
}

export interface DebateAgentState {
  bull_case: CaseOutput;
  bear_case: CaseOutput;
  key_conflicts: string[];
}

export type Recommendation = "BUY" | "HOLD" | "SELL" | "WATCH";

export interface ThesisAgentState {
  recommendation: Recommendation;
  confidence: number; // 0-10
  investment_thesis: string;
  key_reasons: string[];
  potential_risks: string[];
  next_steps: string[];
  disclaimer: string;
}

// One in-progress or completed analysis turn in the chat.
export interface AnalysisTurn {
  id: string;
  query: string;
  status: "streaming" | "done" | "error";
  error: string | null;
  plan: PlannerState | null;
  research: ResearchData | null;
  risks: RiskState | null;
  debate: DebateAgentState | null;
  thesis: ThesisAgentState | null;
  completedTasks: AgentTask[];
}

export const AGENT_STEPS: { key: AgentTask; label: string }[] = [
  { key: "research_agent", label: "Research" },
  { key: "risk_agent", label: "Risk" },
  { key: "debate_agent", label: "Debate" },
  { key: "thesis_agent", label: "Verdict" },
];