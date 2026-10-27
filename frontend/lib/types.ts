// ---------------------------------------------------------------------------
// Mirrors backend/schemas/*.py and backend/database/models.py field-for-field.
// If the backend Pydantic models change, update this file to match — the
// frontend has no source of truth beyond what the API actually sends.
// ---------------------------------------------------------------------------

/** The four agents the planner can schedule (schemas/planner_state.py::Agent). */
export type AgentTask =
  | "research_agent"
  | "risk_agent"
  | "debate_agent"
  | "thesis_agent";

/** Every node the LangGraph graph can emit over the SSE stream (graph/graph.py). */
export type GraphNode =
  | "guardrail_agent"
  | "planner_agent"
  | AgentTask
  | "general_finance_agent";

// --- guardrail_agent (schemas/guardrail_state.py) -------------------------

export type QueryCategory = "company_analysis" | "general_finance" | "irrelevant";

export interface GuardrailDecision {
  category: QueryCategory;
  reason: string;
}

// --- planner_agent (schemas/planner_state.py) ------------------------------

export interface PlannerState {
  companies: string[];
  tasks: AgentTask[];
}

// --- research_agent (schemas/research_state.py) ----------------------------

export interface ToolOutputDict {
  tool: string;
  tool_input: Record<string, unknown>;
  output: unknown;
}

export interface ResearchData {
  summary: string;
  tool_data: ToolOutputDict[];
}

// --- risk_agent (schemas/risk_state.py) ------------------------------------

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface RiskState {
  risk_score: number; // 1-10
  risk_level: RiskLevel;
  summary: string;
  mitigating_factors: string[];
  risks: string[];
}

// --- debate_agent (schemas/debate_state.py) --------------------------------

export interface CaseOutput {
  summary: string;
  arguments: string[];
}

export interface DebateAgentState {
  bull_case: CaseOutput;
  bear_case: CaseOutput;
  key_conflicts: string[];
}

// --- thesis_agent (schemas/thesis_state.py) --------------------------------

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

// --- general_finance_agent (schemas/general_finance_state.py) -------------

export type GeneralFinanceMode = "conceptual" | "memory_followup";

export interface GeneralFinanceAnswer {
  mode: GeneralFinanceMode;
  answer: string;
  key_points: string[];
}

// --- REST resources (database/models.py via schemas/conversation.py) ------

export interface ConversationListItem {
  id: string;
  title: string;
  updated_at: string;
}

export interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  agent_name?: string | null;
  content: string;
  created_at: string;
}

// --- SSE stream (api/helpers.py::serialize_node_output) -------------------

export interface StreamEventData {
  success?: boolean;
  error?: string | null;
  guardrail?: GuardrailDecision;
  plan?: PlannerState;
  completed_tasks?: AgentTask[];
  research?: ResearchData;
  risks?: RiskState;
  debate?: DebateAgentState;
  thesis?: ThesisAgentState;
  general_finance?: GeneralFinanceAnswer;
}

export interface StreamEvent {
  node: GraphNode | "done" | "error";
  data?: StreamEventData;
  /** Only present on the top-level {node:"error"} event (unhandled exception). */
  error?: string;
}

// ---------------------------------------------------------------------------
// Client-side view model — one chat exchange, assembled from stream events
// (live) or from GET /conversations/{id}/messages (reloaded history).
// ---------------------------------------------------------------------------

export type TurnStatus = "streaming" | "done" | "error";

export interface AnalysisTurn {
  id: string;
  query: string;
  status: TurnStatus;
  error: string | null;
  guardrail: GuardrailDecision | null;
  plan: PlannerState | null;
  research: ResearchData | null;
  risks: RiskState | null;
  debate: DebateAgentState | null;
  thesis: ThesisAgentState | null;
  generalFinance: GeneralFinanceAnswer | null;
  completedTasks: AgentTask[];
  fromHistory?: boolean;
  /**
   * Raw log of every SSE event this turn received, in arrival order. Client-
   * only — never persisted, so reloaded history turns always start with an
   * empty log.
   */
  events: StreamLogEntry[];
}

export interface StreamLogEntry {
  id: string;
  node: GraphNode | "done" | "error";
  timestamp: number; // Date.now() when the event arrived client-side
  summary: string;
  /** true = node succeeded, false = node/stream failed, null = terminal/neutral event (e.g. "done") */
  success: boolean | null;
}

export const AGENT_STEPS: { key: AgentTask; label: string }[] = [
  { key: "research_agent", label: "Research" },
  { key: "risk_agent", label: "Risk" },
  { key: "debate_agent", label: "Debate" },
  { key: "thesis_agent", label: "Verdict" },
];