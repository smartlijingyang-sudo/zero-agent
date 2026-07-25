import type { AgentDefinition } from "@zero-agent/agent-framework/agent";
import { createWebSearchTool } from "./tools/web-search.js";

export const plannerAgentDefinition: AgentDefinition = {
  name: "planner",
  systemPrompt: "",
  tools: [createWebSearchTool()],
  guardrails: [],
  maxSteps: 20,
};
