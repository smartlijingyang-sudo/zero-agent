import { createLogger } from "@zero-agent/logger";

const logger = createLogger("agent-memory");

export interface MemoryEntry {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface MemoryStore {
  append(entry: MemoryEntry): Promise<void>;
  getRecent(sessionId: string, limit: number): Promise<MemoryEntry[]>;
  clear(sessionId: string): Promise<void>;
}

export function createMemoryStore(): MemoryStore {
  logger.info("memory store created");
  return {
    async append(_entry) {
      throw new Error("not implemented — wire up data-clients db/cache");
    },
    async getRecent(_sessionId, _limit) {
      throw new Error("not implemented — wire up data-clients db/cache");
    },
    async clear(_sessionId) {
      throw new Error("not implemented — wire up data-clients db/cache");
    },
  };
}
