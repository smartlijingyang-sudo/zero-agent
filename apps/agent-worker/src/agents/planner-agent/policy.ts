import type { AgentDefinition } from "@zero-agent/agent-framework/agent";
import { PLANNER_SYSTEM_PROMPT } from "./prompt.js";

export const plannerAgentDefinition: AgentDefinition = {
  name: "planner",
  systemPrompt: PLANNER_SYSTEM_PROMPT,
  tools: [],
  guardrails: [],
  maxSteps: 20,
};
