import type { AgentDefinition } from "@zero-agent/agent-framework/agent";
import { createFileEditTool } from "./tools/file-edit.js";
import { createWebSearchTool } from "./tools/web-search.js";

export const coderAgentDefinition: AgentDefinition = {
  name: "coder",
  systemPrompt: "",
  tools: [createFileEditTool(), createWebSearchTool()],
  guardrails: [],
  maxSteps: 50,
};
