import type {
  AgentTask,
  AnalysisTurn,
  DebateAgentState,
  GeneralFinanceAnswer,
  MessageResponse,
  ResearchData,
  RiskState,
  ThesisAgentState,
} from "./types";

// The AGENT_STEPS order (dependency order: research -> risk -> debate -> thesis).
const SECTION_ORDER: AgentTask[] = [
  "research_agent",
  "risk_agent",
  "debate_agent",
  "thesis_agent",
];

type ClassifiedSection =
  | { task: "research_agent"; data: ResearchData }
  | { task: "risk_agent"; data: RiskState }
  | { task: "debate_agent"; data: DebateAgentState }
  | { task: "thesis_agent"; data: ThesisAgentState }
  | { task: "general_finance"; data: GeneralFinanceAnswer }
  | null;

/**
 * GET /conversations/{id}/messages returns only {id, role, content,
 * created_at} — no agent_name (schemas/conversation.py::MessageResponse).
 * api/helpers.py::get_message_content only ever persists the JSON dump of
 * exactly one of ResearchData / RiskState / DebateAgent / ThesisAgent /
 * GeneralFinanceAnswer as an assistant message, and each of those schemas
 * has a field no other one has — so we can tell them apart reliably by
 * shape alone.
 */
function classify(raw: string): ClassifiedSection {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof obj !== "object" || obj === null) return null;
  const data = obj as Record<string, unknown>;

  if ("risk_score" in data) return { task: "risk_agent", data: data as unknown as RiskState };
  if ("bull_case" in data) return { task: "debate_agent", data: data as unknown as DebateAgentState };
  if ("recommendation" in data) return { task: "thesis_agent", data: data as unknown as ThesisAgentState };
  if ("mode" in data && "answer" in data) return { task: "general_finance", data: data as unknown as GeneralFinanceAnswer };
  if ("tool_data" in data && "summary" in data) return { task: "research_agent", data: data as unknown as ResearchData };
  return null;
}

function emptyTurn(id: string, query: string): AnalysisTurn {
  return {
    id,
    query,
    status: "done",
    error: null,
    guardrail: null,
    plan: null,
    research: null,
    risks: null,
    debate: null,
    thesis: null,
    generalFinance: null,
    completedTasks: [],
    fromHistory: true,
    events: [], // stream log is client-only, never persisted — nothing to reconstruct
  };
}

/** Groups a flat, chronological message list into one AnalysisTurn per user query. */
export function reconstructTurns(messages: MessageResponse[]): AnalysisTurn[] {
  const turns: AnalysisTurn[] = [];
  let current: AnalysisTurn | null = null;

  for (const message of messages) {
    if (message.role === "user") {
      current = emptyTurn(message.id, message.content);
      turns.push(current);
      continue;
    }

    if (!current) continue; // orphaned assistant message — shouldn't happen, skip defensively

    const section = classify(message.content);
    if (!section) continue;

    if (section.task === "general_finance") {
      current.generalFinance = section.data;
    } else {
      switch (section.task) {
        case "research_agent":
          current.research = section.data;
          break;
        case "risk_agent":
          current.risks = section.data;
          break;
        case "debate_agent":
          current.debate = section.data;
          break;
        case "thesis_agent":
          current.thesis = section.data;
          break;
      }
      if (!current.completedTasks.includes(section.task)) {
        current.completedTasks = [...current.completedTasks, section.task];
      }
    }
  }

  // Synthesize a `plan` for turns that went through the company-analysis
  // path, since the planner's own output (companies, task order) is never
  // persisted. `companies` can't be recovered; `tasks` is inferred from
  // which sections actually landed, in their fixed dependency order.
  for (const turn of turns) {
    if (turn.completedTasks.length > 0) {
      turn.plan = {
        companies: [],
        tasks: SECTION_ORDER.filter((t) => turn.completedTasks.includes(t)),
      };
    }
  }

  return turns;
}