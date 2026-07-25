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

class InMemoryStore implements MemoryStore {
  private entries = new Map<string, MemoryEntry[]>();

  async append(entry: MemoryEntry): Promise<void> {
    const list = this.entries.get(entry.sessionId) ?? [];
    list.push(entry);
    this.entries.set(entry.sessionId, list);
  }

  async getRecent(sessionId: string, limit: number): Promise<MemoryEntry[]> {
    const list = this.entries.get(sessionId) ?? [];
    return list.slice(-limit);
  }

  async clear(sessionId: string): Promise<void> {
    this.entries.delete(sessionId);
  }
}

export function createMemoryStore(): MemoryStore {
  logger.info("in-memory store created");
  return new InMemoryStore();
}
