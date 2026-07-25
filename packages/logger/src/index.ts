export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

export function createLogger(name: string): Logger {
  const format = (level: LogLevel, msg: string, meta?: Record<string, unknown>) =>
    JSON.stringify({ level, name, msg, ...meta, ts: new Date().toISOString() });

  return {
    debug: (msg, meta) => console.debug(format("debug", msg, meta)),
    info: (msg, meta) => console.info(format("info", msg, meta)),
    warn: (msg, meta) => console.warn(format("warn", msg, meta)),
    error: (msg, meta) => console.error(format("error", msg, meta)),
    child(bindings) {
      return createLogger(`${name}:${JSON.stringify(bindings)}`);
    },
  };
}
