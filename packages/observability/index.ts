import { createLogger, type Logger } from "@zero-agent/logger";

/**
 * Unified trace/metrics facade.
 * Agent decision steps should be traceable through this.
 */

export interface Span {
  name: string;
  end(status: "ok" | "error"): void;
}

const logger: Logger = createLogger("observability");

export function startSpan(name: string, attributes?: Record<string, string>): Span {
  logger.debug("span:start", { name, ...attributes });
  return {
    name,
    end(status) {
      logger.debug("span:end", { name, status });
    },
  };
}

export function recordMetric(name: string, value: number, tags?: Record<string, string>): void {
  logger.debug("metric", { name, value, ...tags });
}

export function recordError(error: Error, context?: Record<string, unknown>): void {
  logger.error(error.message, { stack: error.stack, ...context });
}
