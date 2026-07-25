import { createLogger } from "@zero-agent/logger";

const logger = createLogger("agent-rag");

export interface RetrievalResult {
  content: string;
  score: number;
  source: string;
}

export interface RagPipeline {
  retrieve(query: string, topK?: number): Promise<RetrievalResult[]>;
  index(document: { content: string; source: string }): Promise<void>;
}

export function createRagPipeline(): RagPipeline {
  logger.info("rag pipeline created");
  return {
    async retrieve(_query, _topK) {
      throw new Error("not implemented — wire up embedding + vector search");
    },
    async index(_document) {
      throw new Error("not implemented — wire up chunking + embedding + vector upsert");
    },
  };
}
