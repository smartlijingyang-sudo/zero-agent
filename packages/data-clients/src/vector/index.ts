import { createLogger } from "@zero-agent/logger";

const logger = createLogger("data-clients:vector");

export interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface VectorQueryResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface VectorClient {
  upsert(records: VectorRecord[]): Promise<void>;
  query(embedding: number[], topK: number): Promise<VectorQueryResult[]>;
  delete(ids: string[]): Promise<void>;
}

export function createVectorClient(_url: string): VectorClient {
  logger.info("vector client created", { url: _url });
  return {
    async upsert(_records) {
      throw new Error("not implemented — wire up your vector DB driver");
    },
    async query(_embedding, _topK) {
      throw new Error("not implemented — wire up your vector DB driver");
    },
    async delete(_ids) {
      throw new Error("not implemented — wire up your vector DB driver");
    },
  };
}
