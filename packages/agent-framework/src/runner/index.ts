import { createLogger } from "@zero-agent/logger";
import { traceAgentStep } from "../tracing/index.js";
import type { AgentDefinition } from "../agent/index.js";
import type { MemoryStore } from "@zero-agent/agent-memory";
import type {
  ModelProvider,
  ProviderResponse,
  ProviderToolCall,
  ProviderToolDefinition,
} from "@zero-agent/agent-providers";
import type { Tool } from "../tools/index.js";

const logger = createLogger("agent-framework:runner");

export interface RunResult {
  agentName: string;
  steps: number;
  output: string;
}

interface RunDeps {
  provider: ModelProvider;
  memory: MemoryStore;
  sessionId: string;
  emit: (event: unknown) => void;
}

interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

function toolsToProviderFormat(tools: Tool[]): ProviderToolDefinition[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: { type: "object", properties: {} },
  }));
}

export async function run(
  agent: AgentDefinition,
  input: string,
  deps: RunDeps,
): Promise<RunResult> {
  const { provider, memory, sessionId, emit } = deps;
  const recent = await memory.getRecent(sessionId, 20);

  const context: LLMMessage[] = [
    { role: "system", content: agent.systemPrompt },
    ...recent.map((e) => ({
      role: e.role as LLMMessage["role"],
      content: e.content,
    })),
    { role: "user", content: input },
  ];

  const providerTools = toolsToProviderFormat(agent.tools);
  let step = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (step >= agent.maxSteps) {
      logger.warn("max steps reached", { agent: agent.name, maxSteps: agent.maxSteps });
      return { agentName: agent.name, steps: step, output: "Max steps reached" };
    }

    emit({
      type: "agent.protocol.step_started",
      payload: { sessionId, stepNumber: step, startedAt: new Date().toISOString() },
    });

    // Guardrails: check input on first step
    if (step === 0) {
      for (const g of agent.guardrails) {
        if (g.checkInput) {
          const result = await g.checkInput(input);
          if (result.tripwireTriggered) {
            throw new Error(`Guardrail blocked: ${result.reason ?? g.name}`);
          }
        }
      }
    }

    const response = (await traceAgentStep(agent.name, step, () =>
      provider.complete({ messages: context, tools: providerTools }),
    )) as ProviderResponse;

    if (response.toolCalls.length > 0) {
      // Emit assistant message with tool calls into context
      context.push({
        role: "assistant",
        content: response.content ?? undefined,
        tool_calls: response.toolCalls.map((tc: ProviderToolCall) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: JSON.stringify(tc.input) },
        })),
      });

      for (const tc of response.toolCalls) {
        const tool = agent.tools.find((t) => t.name === tc.name);
        if (!tool) {
          context.push({
            role: "tool",
            tool_call_id: tc.id,
            content: `Error: unknown tool "${tc.name}"`,
          });
          continue;
        }

        emit({
          type: "agent.protocol.tool_call_started",
          payload: {
            sessionId,
            toolName: tc.name,
            input: tc.input,
            startedAt: new Date().toISOString(),
          },
        });

        // Approval placeholder for requiresConfirmation tools
        if (tool.risk.requiresConfirmation) {
          emit({
            type: "agent.protocol.approval_requested",
            payload: {
              sessionId,
              toolName: tc.name,
              input: tc.input,
              requestedAt: new Date().toISOString(),
            },
          });
          // MVP: auto-approve
          emit({
            type: "agent.protocol.approval_resolved",
            payload: {
              sessionId,
              toolName: tc.name,
              approved: true,
              resolvedAt: new Date().toISOString(),
            },
          });
        }

        let result: unknown;
        try {
          result = await traceAgentStep(`${agent.name}:tool:${tc.name}`, step, () =>
            tool.execute(tc.input),
          );
        } catch (err) {
          result = `Error: ${err instanceof Error ? err.message : String(err)}`;
        }

        emit({
          type: "agent.protocol.tool_call_completed",
          payload: {
            sessionId,
            toolName: tc.name,
            output: result,
            completedAt: new Date().toISOString(),
          },
        });

        context.push({
          role: "tool",
          tool_call_id: tc.id,
          content: typeof result === "string" ? result : JSON.stringify(result),
        });
      }

      step++;
      continue;
    }

    // Final text response
    const output = response.content ?? "";

    for (const g of agent.guardrails) {
      if (g.checkOutput) {
        const result = await g.checkOutput(output);
        if (result.tripwireTriggered) {
          throw new Error(`Guardrail blocked output: ${result.reason ?? g.name}`);
        }
      }
    }

    await memory.append({ sessionId, role: "user", content: input, timestamp: new Date().toISOString() });
    await memory.append({
      sessionId,
      role: "assistant",
      content: output,
      timestamp: new Date().toISOString(),
    });

    emit({
      type: "agent.protocol.token_delta",
      payload: { sessionId, delta: output },
    });

    emit({
      type: "agent.protocol.step_completed",
      payload: { sessionId, stepNumber: step, completedAt: new Date().toISOString() },
    });

    return { agentName: agent.name, steps: step + 1, output };
  }
}
