import { createLogger } from "@zero-agent/logger";

const logger = createLogger("data-clients:queue");

export interface QueueClient {
  publish(channel: string, message: unknown): Promise<void>;
  subscribe(channel: string, handler: (message: unknown) => void | Promise<void>): Promise<void>;
}

export function createQueueClient(url: string): QueueClient {
  logger.info("queue client created", { url });
  return {
    async publish(_channel, _message) {
      throw new Error("not implemented — wire up your MQ driver");
    },
    async subscribe(_channel, _handler) {
      throw new Error("not implemented — wire up your MQ driver");
    },
  };
}
