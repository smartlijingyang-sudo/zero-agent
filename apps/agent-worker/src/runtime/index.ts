import { createLogger } from "@zero-agent/logger";
import { createQueueClient } from "@zero-agent/data-clients/queue";
import { run } from "@zero-agent/agent-framework/runner";
import { coderAgentDefinition } from "../agents/coder-agent/index.js";
import { plannerAgentDefinition } from "../agents/planner-agent/index.js";

const logger = createLogger("agent-worker:runtime");

export async function startRuntime(): Promise<void> {
  const mqUrl = process.env["MQ_URL"] ?? "memory://localhost";
  const queue = createQueueClient(mqUrl);

  logger.info("subscribing to agent task queue");

  await queue.subscribe("agent-tasks", async (message) => {
    logger.info("received task", { message });

    const agent = coderAgentDefinition;
    const result = await run(agent, String(message));

    logger.info("task completed", { agent: result.agentName, steps: result.steps });
  });

  logger.info("agent-worker runtime started", {
    agents: [coderAgentDefinition.name, plannerAgentDefinition.name],
  });
}
