import { createLogger } from "@zero-agent/logger";

const logger = createLogger("data-clients:cache");

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export function createCacheClient(url: string): CacheClient {
  logger.info("cache client created", { url });
  return {
    async get(_key) { return null; },
    async set(_key, _value, _ttlSeconds) {},
    async del(_key) {},
  };
}
