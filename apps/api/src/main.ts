import { loadEnv } from "@zero-agent/config";
import { createLogger } from "@zero-agent/logger";

const logger = createLogger("api");
const env = loadEnv();

logger.info("api starting", { port: env.PORT, env: env.NODE_ENV });

// TODO: wire up HTTP framework (hono / fastify / express)
// TODO: register modules from src/modules/
