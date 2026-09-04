import type { StreamEvent } from "./types";

/** Turns one raw SSE event into a short, human-readable log line. */
export function summarizeEvent(event: StreamEvent): { summary: string; success: boolean | null } {
  if (event.node === "done") return { summary: "Stream closed.", success: null };
  if (event.node === "error") return { summary: event.error ?? "Unknown error.", success: false };

  const data = event.data;
  if (!data) return { summary: "(no data)", success: null };

  if (data.success === false) {
    return { summary: data.error ?? "Failed.", success: false };
  }

  switch (event.node) {
    case "guardrail_agent":
      if (data.guardrail) {
        return {
          summary: `${data.guardrail.category.replace(/_/g, " ")} — ${data.guardrail.reason}`,
          success: true,
        };
      }
      break;
    case "planner_agent":
      if (data.plan) {
        const companies = data.plan.companies.length ? data.plan.companies.join(", ") : "no ticker found";
        const tasks = data.plan.tasks.length
          ? data.plan.tasks.map((t) => t.replace("_agent", "")).join(" → ")
          : "no further agents needed";
        return { summary: `${companies} · ${tasks}`, success: true };
      }
      break;
    case "research_agent":
      if (data.research) {
        return { summary: `${data.research.tool_data.length} tool call(s) gathered`, success: true };
      }
      break;
    case "risk_agent":
      if (data.risks) {
        return { summary: `${data.risks.risk_level} risk (${data.risks.risk_score}/10)`, success: true };
      }
      break;
    case "debate_agent":
      if (data.debate) {
        return { summary: `${data.debate.key_conflicts.length} point(s) of conflict flagged`, success: true };
      }
      break;
    case "thesis_agent":
      if (data.thesis) {
        return {
          summary: `${data.thesis.recommendation} · ${data.thesis.confidence}/10 confidence`,
          success: true,
        };
      }
      break;
    case "general_finance_agent":
      if (data.general_finance) {
        return { summary: `${data.general_finance.mode.replace("_", " ")} answer drafted`, success: true };
      }
      break;
  }

  return { summary: "Completed.", success: true };
}