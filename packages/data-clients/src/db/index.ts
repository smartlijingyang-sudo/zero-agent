import { createLogger } from "@zero-agent/logger";

const logger = createLogger("data-clients:db");

export interface DbClient {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

export function createDbClient(url: string): DbClient {
  logger.info("db client created", { url: url.replace(/\/\/.*@/, "//***@") });
  return {
    async query<T>(_sql: string, _params?: unknown[]): Promise<T[]> {
      throw new Error("not implemented — wire up your db driver");
    },
    async execute(_sql: string, _params?: unknown[]): Promise<void> {
      throw new Error("not implemented — wire up your db driver");
    },
  };
}
