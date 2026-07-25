import { createLogger } from "@zero-agent/logger";
import type { AgentDefinition } from "../agent/index.js";

const logger = createLogger("agent-framework:runner");

export interface RunResult {
  agentName: string;
  steps: number;
  output: string;
}

export async function run(_agent: AgentDefinition, _input: string): Promise<RunResult> {
  logger.info("runner invoked", { agent: _agent.name });
  throw new Error("not implemented — wire up the execution loop");
}
