import { randomUUID } from "node:crypto";
import { createLogger } from "@zero-agent/logger";
import { createModelProvider } from "@zero-agent/agent-providers";
import { createMemoryStore } from "@zero-agent/agent-memory";
import { run } from "@zero-agent/agent-framework/runner";
import type { AgentDefinition } from "@zero-agent/agent-framework/agent";

const logger = createLogger("api:chat:service");

const DEFAULT_AGENT: AgentDefinition = {
  name: "assistant",
  systemPrompt:
    "You are a helpful assistant. Answer questions clearly and concisely.",
  tools: [],
  guardrails: [],
  maxSteps: 10,
};

type SessionSubscriber = (event: unknown) => void;

export class ChatService {
  private provider = createModelProvider({
    provider: process.env["LLM_PROVIDER"] ?? "openai",
    apiKey: process.env["LLM_API_KEY"] ?? "",
    model: process.env["LLM_MODEL"] ?? "qwen-plus",
    baseUrl: process.env["LLM_BASE_URL"],
  });
  private memory = createMemoryStore();
  private subscribers = new Map<string, Set<SessionSubscriber>>();
  private runPromises = new Map<string, Promise<void>>();

  async createSession(input: { userId?: string }) {
    const id = randomUUID();
    const userId = input.userId ?? randomUUID();
    const createdAt = new Date().toISOString();
    logger.info("session created", { sessionId: id });
    return { id, userId, createdAt };
  }

  async sendMessage(sessionId: string, input: { content: string }) {
    const emit = (event: unknown) => {
      const subs = this.subscribers.get(sessionId);
      if (subs) {
        for (const sub of subs) sub(event);
      }
    };

    const runPromise = run(DEFAULT_AGENT, input.content, {
      provider: this.provider,
      memory: this.memory,
      sessionId,
      emit,
    })
      .then((result) => {
        logger.info("agent completed", { sessionId, steps: result.steps });
      })
      .catch((err) => {
        logger.error("agent failed", { sessionId, error: err });
      });

    this.runPromises.set(sessionId, runPromise);
    return { status: "accepted" };
  }

  async subscribeToSession(
    sessionId: string,
    callback: SessionSubscriber,
  ): Promise<void> {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }
    this.subscribers.get(sessionId)!.add(callback);

    // Wait for the agent run to start (sendMessage sets the promise)
    let runPromise = this.runPromises.get(sessionId);
    if (!runPromise) {
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          const p = this.runPromises.get(sessionId);
          if (p) {
            clearInterval(check);
            runPromise = p;
            resolve();
          }
        }, 50);
        // Timeout after 30s — no message was sent
        setTimeout(() => {
          clearInterval(check);
          resolve();
        }, 30_000);
      });
    }

    // Wait for the agent run to complete
    if (runPromise) {
      await runPromise;
    }

    this.subscribers.get(sessionId)?.delete(callback);
  }
}
