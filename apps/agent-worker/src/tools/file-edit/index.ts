export interface FileEditTool {
  name: "file-edit";
  execute(params: { path: string; content: string }): Promise<void>;
}

export function createFileEditTool(): FileEditTool {
  return {
    name: "file-edit",
    async execute(_params) {
      throw new Error("not implemented — wire up file system operations");
    },
  };
}
