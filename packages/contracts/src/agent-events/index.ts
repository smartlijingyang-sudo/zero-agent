import { z } from "zod";

/**
 * Async message contracts between api ↔ agent-worker over MQ.
 * These are the ONLY contracts for cross-app async communication.
 */
export const AgentTaskRequestedSchema = z.object({
  type: z.literal("agent.task.requested"),
  payload: z.object({
    taskId: z.string().uuid(),
    userId: z.string().uuid(),
    input: z.string(),
    requestedAt: z.string().datetime(),
  }),
});

export const AgentTaskCompletedSchema = z.object({
  type: z.literal("agent.task.completed"),
  payload: z.object({
    taskId: z.string().uuid(),
    result: z.string(),
    completedAt: z.string().datetime(),
  }),
});

export const AgentTaskFailedSchema = z.object({
  type: z.literal("agent.task.failed"),
  payload: z.object({
    taskId: z.string().uuid(),
    error: z.string(),
    failedAt: z.string().datetime(),
  }),
});

export const AgentEventSchema = z.discriminatedUnion("type", [
  AgentTaskRequestedSchema,
  AgentTaskCompletedSchema,
  AgentTaskFailedSchema,
]);

export type AgentTaskRequested = z.infer<typeof AgentTaskRequestedSchema>;
export type AgentTaskCompleted = z.infer<typeof AgentTaskCompletedSchema>;
export type AgentTaskFailed = z.infer<typeof AgentTaskFailedSchema>;
export type AgentEvent = z.infer<typeof AgentEventSchema>;
