import { startSpan } from "@zero-agent/observability";

export async function traceAgentStep<T>(
  agentName: string,
  step: number,
  fn: () => Promise<T>,
): Promise<T> {
  const span = startSpan(`agent:${agentName}:step:${step}`, { agent: agentName, step: String(step) });
  try {
    const result = await fn();
    span.end("ok");
    return result;
  } catch (error) {
    span.end("error");
    throw error;
  }
}
