import { createLogger } from "@zero-agent/logger";

const logger = createLogger("agent-providers");

export interface ModelProvider {
  name: string;
  complete(input: { messages: unknown[]; tools?: unknown[] }): Promise<unknown>;
  stream?(input: { messages: unknown[] }): AsyncIterable<unknown>;
}

export function createModelProvider(_config: { provider: string; apiKey: string }): ModelProvider {
  logger.info("model provider created", { provider: _config.provider });
  return {
    name: _config.provider,
    async complete(_input) {
      throw new Error("not implemented — wire up LLM provider");
    },
  };
}
