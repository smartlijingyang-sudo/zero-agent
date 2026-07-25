import { createLogger } from "@zero-agent/logger";
import { createQueueClient } from "@zero-agent/data-clients/queue";
import { createModelProvider } from "@zero-agent/agent-providers";
import { createMemoryStore } from "@zero-agent/agent-memory";
import { run } from "@zero-agent/agent-framework/runner";
import { AgentTaskRequestedSchema } from "@zero-agent/contracts/agent-events";
import { coderAgentDefinition } from "../agents/coder-agent/index.js";
import { plannerAgentDefinition } from "../agents/planner-agent/index.js";

const logger = createLogger("agent-worker:runtime");

export async function startRuntime(): Promise<void> {
  const mqUrl = process.env["MQ_URL"] ?? "memory://localhost";
  const queue = createQueueClient(mqUrl);
  const provider = createModelProvider({
    provider: process.env["LLM_PROVIDER"] ?? "openai",
    apiKey: process.env["LLM_API_KEY"] ?? "",
    model: process.env["LLM_MODEL"] ?? "qwen-plus",
    baseUrl: process.env["LLM_BASE_URL"],
  });
  const memory = createMemoryStore();

  logger.info("subscribing to agent task queue");

  await queue.subscribe("agent-tasks", async (message) => {
    const event = AgentTaskRequestedSchema.parse(message);
    const { taskId, input } = event.payload;
    const sessionId = taskId;

    logger.info("received task", { taskId, inputLength: input.length });

    const protocolEmitter = (evt: unknown) => {
      void queue.publish(`agent-protocol:${sessionId}`, evt);
    };

    const resultPromise = new Promise<string>((resolve, reject) => {
      void queue.subscribe(`agent-protocol:${sessionId}`, (evt) => {
        const e = evt as { type: string; payload?: { result?: string; error?: string } };
        if (e.type === "agent.task.completed") resolve(e.payload?.result ?? "");
        if (e.type === "agent.task.failed") reject(new Error(e.payload?.error ?? "unknown"));
      });
    });

    try {
      const result = await run(
        coderAgentDefinition,
        input,
        { provider, memory, sessionId, emit: protocolEmitter },
      );
      await queue.publish(`agent-protocol:${sessionId}`, {
        type: "agent.task.completed",
        payload: { taskId, result: result.output, completedAt: new Date().toISOString() },
      });
      logger.info("task completed", { taskId, steps: result.steps });
    } catch (err) {
      await queue.publish(`agent-protocol:${sessionId}`, {
        type: "agent.task.failed",
        payload: {
          taskId,
          error: err instanceof Error ? err.message : String(err),
          failedAt: new Date().toISOString(),
        },
      });
      logger.error("task failed", { taskId, error: err });
    }

    await resultPromise;
  });

  logger.info("agent-worker runtime started", {
    agents: [coderAgentDefinition.name, plannerAgentDefinition.name],
  });
}
