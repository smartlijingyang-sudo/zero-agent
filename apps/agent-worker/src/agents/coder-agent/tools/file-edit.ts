import type { Tool } from "@zero-agent/agent-framework/tools";

interface FileEditInput {
  path: string;
  content: string;
}

export function createFileEditTool(): Tool<FileEditInput, void> {
  return {
    name: "file-edit",
    description: "Edit a file on disk. Has side effects — requires human confirmation.",
    risk: { sideEffects: true, requiresConfirmation: true },
    async execute(_params) {
      throw new Error("not implemented — wire up file system operations");
    },
  };
}
