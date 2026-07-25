import { createLogger } from "@zero-agent/logger";

const logger = createLogger("worker");

logger.info("worker starting — generic async task processor");

// TODO: subscribe to job queues via data-clients/queue
// TODO: register job handlers from src/jobs/
