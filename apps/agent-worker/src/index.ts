import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(import.meta.dirname, "../../../.env") });
import { createLogger } from "@zero-agent/logger";
import { startRuntime } from "./runtime/index.js";

const logger = createLogger("agent-worker");

logger.info("agent-worker starting");

await startRuntime();
