import type { AgentDefinition } from "@zero-agent/agent-framework/agent";
import { CODER_SYSTEM_PROMPT } from "./prompt.js";
import { createWebSearchTool } from "./tools/web-search.js";

export const coderAgentDefinition: AgentDefinition = {
  name: "coder",
  systemPrompt: CODER_SYSTEM_PROMPT,
  tools: [createWebSearchTool()],
  guardrails: [],
  maxSteps: 50,
};
