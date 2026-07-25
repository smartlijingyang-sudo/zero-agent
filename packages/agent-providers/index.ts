import OpenAI from "openai";
import { createLogger } from "@zero-agent/logger";

const logger = createLogger("agent-providers");

export interface ModelProvider {
  name: string;
  complete(input: { messages: unknown[]; tools?: unknown[] }): Promise<unknown>;
  stream?(input: { messages: unknown[] }): AsyncIterable<unknown>;
}

export interface ProviderToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ProviderToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface ProviderResponse {
  content: string | null;
  toolCalls: ProviderToolCall[];
}

export function createModelProvider(config: {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}): ModelProvider {
  const client = new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });
  const model = config.model;

  logger.info("model provider created", { provider: config.provider, model });

  return {
    name: config.provider,

    async complete(input: { messages: unknown[]; tools?: unknown[] }) {
      const messages = input.messages as OpenAI.ChatCompletionMessageParam[];
      const toolDefs = input.tools as ProviderToolDefinition[] | undefined;

      const tools: OpenAI.ChatCompletionTool[] | undefined = toolDefs?.length
        ? toolDefs.map((t) => ({
            type: "function" as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          }))
        : undefined;

      const response = await client.chat.completions.create({
        model,
        messages,
        ...(tools ? { tools } : {}),
      });

      const msg = response.choices[0]?.message;
      const content = msg?.content ?? null;

      const toolCalls: ProviderToolCall[] = (msg?.tool_calls ?? []).map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        input: safeJsonParse(tc.function.arguments),
      }));

      return { content, toolCalls } satisfies ProviderResponse;
    },
  };
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
