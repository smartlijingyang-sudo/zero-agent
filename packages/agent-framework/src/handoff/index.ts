import type { AgentDefinition } from "../agent/index.js";

export interface HandoffResult {
  fromAgent: string;
  toAgent: string;
  context: string;
}

export function resolveHandoff(
  _source: AgentDefinition,
  _targetName: string,
): AgentDefinition | undefined {
  return _source.handoffTo?.find((a) => a.name === _targetName);
}
