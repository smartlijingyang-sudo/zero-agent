import type { Tool } from "@zero-agent/agent-framework/tools";

export function createWebSearchTool(): Tool<string, string> {
  return {
    name: "web-search",
    description: "Search the web for information. Read-only — no confirmation needed.",
    risk: { sideEffects: false, requiresConfirmation: false },
    async execute(_query: string) {
      throw new Error("not implemented — wire up search provider");
    },
  };
}
