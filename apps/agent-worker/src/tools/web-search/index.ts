export interface WebSearchTool {
  name: "web-search";
  execute(query: string): Promise<string>;
}

export function createWebSearchTool(): WebSearchTool {
  return {
    name: "web-search",
    async execute(_query: string) {
      throw new Error("not implemented — wire up search provider");
    },
  };
}
