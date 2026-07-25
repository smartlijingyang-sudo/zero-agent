import type { Tool } from "../tools/index.js";
import type { Guardrail } from "../guardrails/index.js";

export interface AgentDefinition {
  name: string;
  systemPrompt: string;
  tools: Tool[];
  guardrails: Guardrail[];
  maxSteps: number;
  handoffTo?: AgentDefinition[];
}
