import { createLogger } from "@zero-agent/logger";
import type { AgentDefinition } from "@zero-agent/agent-framework/agent";

const logger = createLogger("agent-evals");

export interface EvalCase {
  name: string;
  input: string;
  expectedOutput?: string;
  scoringCriteria?: string;
}

export interface EvalResult {
  caseName: string;
  passed: boolean;
  score: number;
  details?: string;
}

export interface Scorer {
  name: string;
  score(actual: string, expected?: string): Promise<number>;
}

export async function runEvalSuite(
  _agent: AgentDefinition,
  _cases: EvalCase[],
  _scorer: Scorer,
): Promise<EvalResult[]> {
  logger.info("eval suite starting", { caseCount: _cases.length, scorer: _scorer.name });
  throw new Error("not implemented — wire up eval runner");
}
