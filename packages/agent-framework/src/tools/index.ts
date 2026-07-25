import { createLogger } from "@zero-agent/logger";

const logger = createLogger("agent-framework:tools");

export interface ToolRiskLevel {
  sideEffects: boolean;
  requiresConfirmation: boolean;
}

export interface Tool<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  risk: ToolRiskLevel;
  execute(input: Input): Promise<Output>;
}

export interface ToolRegistry {
  get(name: string): Tool | undefined;
  list(): Tool[];
}

export function createToolRegistry(tools: Tool[] = []): ToolRegistry {
  const map = new Map(tools.map((t) => [t.name, t]));
  logger.info("tool registry created", { toolCount: map.size });
  return {
    get(name: string) {
      return map.get(name);
    },
    list() {
      return [...map.values()];
    },
  };
}
