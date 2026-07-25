import type { QueueClient } from "@zero-agent/data-clients/queue";
import type { AgentEvent } from "@zero-agent/contracts/agent-events";

/**
 * Domain events published to MQ for agent-worker / other modules to consume.
 * Message format defined by @zero-agent/contracts/agent-events — single source of truth.
 */
export class UserEventPublisher {
  constructor(private readonly queue: QueueClient) {}

  async publish(event: AgentEvent): Promise<void> {
    await this.queue.publish("user-events", event);
  }
}
