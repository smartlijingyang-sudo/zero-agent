import { startSpan } from "@zero-agent/observability";

export interface ApiClient {
  baseUrl: string;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
}

export function createApiClient(baseUrl: string): ApiClient {
  return {
    baseUrl,
    async get<T>(path: string): Promise<T> {
      const span = startSpan("sdk.get", { path });
      try {
        const res = await fetch(`${baseUrl}${path}`);
        if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
        return res.json() as Promise<T>;
      } finally {
        span.end("ok");
      }
    },
    async post<T>(path: string, body: unknown): Promise<T> {
      const span = startSpan("sdk.post", { path });
      try {
        const res = await fetch(`${baseUrl}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
        return res.json() as Promise<T>;
      } finally {
        span.end("ok");
      }
    },
  };
}
