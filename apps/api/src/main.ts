import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(import.meta.dirname, "../../../.env") });
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { loadEnv } from "@zero-agent/config";
import { createLogger } from "@zero-agent/logger";
import { ChatService } from "./modules/chat/chat.service.js";

const logger = createLogger("api");
const env = loadEnv();

const app = new Hono();
app.use("*", cors());

const chatService = new ChatService();

app.post("/api/sessions", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const session = await chatService.createSession(body);
  return c.json(session, 201);
});

app.post("/api/sessions/:id/messages", async (c) => {
  const sessionId = c.req.param("id");
  const body = await c.req.json();
  const result = await chatService.sendMessage(sessionId!, body);
  return c.json(result, 202);
});

app.get("/api/sessions/:id/stream", async (c) => {
  const sessionId = c.req.param("id")!;
  return streamSSE(c, async (stream) => {
    await chatService.subscribeToSession(sessionId, async (event) => {
      await stream.writeSSE({
        event: (event as { type: string }).type,
        data: JSON.stringify(event),
      });
    });
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

serve({ fetch: app.fetch, port: env.PORT, hostname: "0.0.0.0" }, () => {
  logger.info("api started", { port: env.PORT, env: env.NODE_ENV });
});
