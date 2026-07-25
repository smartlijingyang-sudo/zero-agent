import { EventEmitter } from "node:events";
import { createLogger } from "@zero-agent/logger";

const logger = createLogger("data-clients:queue");

export interface QueueClient {
  publish(channel: string, message: unknown): Promise<void>;
  subscribe(channel: string, handler: (message: unknown) => void | Promise<void>): Promise<void>;
}

class InMemoryQueueClient implements QueueClient {
  private emitter = new EventEmitter();

  async publish(channel: string, message: unknown): Promise<void> {
    logger.debug("publish", { channel });
    this.emitter.emit(channel, message);
  }

  async subscribe(
    channel: string,
    handler: (message: unknown) => void | Promise<void>,
  ): Promise<void> {
    logger.debug("subscribe", { channel });
    this.emitter.on(channel, handler);
  }
}

export function createQueueClient(url: string): QueueClient {
  logger.info("queue client created", { url });
  if (url.startsWith("memory://")) {
    return new InMemoryQueueClient();
  }
  throw new Error(`Unsupported queue URL scheme: ${url}`);
}
