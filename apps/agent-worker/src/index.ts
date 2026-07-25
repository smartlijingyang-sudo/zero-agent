import { createLogger } from "@zero-agent/logger";

const logger = createLogger("agent-worker");

logger.info("agent-worker starting");

// TODO: subscribe to MQ events from contracts/agent-events
// TODO: initialize agent runtime
// TODO: wire up orchestration loop
