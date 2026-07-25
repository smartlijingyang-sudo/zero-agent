import { createLogger } from "@zero-agent/logger";
import { startRuntime } from "./runtime/index.js";

const logger = createLogger("agent-worker");

logger.info("agent-worker starting");

await startRuntime();
