import { z } from "zod";

/**
 * Real-time streaming protocol for web/chat consumption.
 * Transport-agnostic (SSE, WebSocket, etc.) — only message schemas are defined here.
 */
export const TokenDeltaSchema = z.object({
  type: z.literal("agent.protocol.token_delta"),
  payload: z.object({
    sessionId: z.string().uuid(),
    delta: z.string(),
  }),
});

export const ToolCallStartedSchema = z.object({
  type: z.literal("agent.protocol.tool_call_started"),
  payload: z.object({
    sessionId: z.string().uuid(),
    toolName: z.string(),
    input: z.unknown(),
    startedAt: z.string().datetime(),
  }),
});

export const ToolCallCompletedSchema = z.object({
  type: z.literal("agent.protocol.tool_call_completed"),
  payload: z.object({
    sessionId: z.string().uuid(),
    toolName: z.string(),
    output: z.unknown(),
    completedAt: z.string().datetime(),
  }),
});

export const StepStartedSchema = z.object({
  type: z.literal("agent.protocol.step_started"),
  payload: z.object({
    sessionId: z.string().uuid(),
    stepNumber: z.number().int().nonnegative(),
    startedAt: z.string().datetime(),
  }),
});

export const StepCompletedSchema = z.object({
  type: z.literal("agent.protocol.step_completed"),
  payload: z.object({
    sessionId: z.string().uuid(),
    stepNumber: z.number().int().nonnegative(),
    completedAt: z.string().datetime(),
  }),
});

export const ApprovalRequestedSchema = z.object({
  type: z.literal("agent.protocol.approval_requested"),
  payload: z.object({
    sessionId: z.string().uuid(),
    toolName: z.string(),
    input: z.unknown(),
    reason: z.string().optional(),
    requestedAt: z.string().datetime(),
  }),
});

export const ApprovalResolvedSchema = z.object({
  type: z.literal("agent.protocol.approval_resolved"),
  payload: z.object({
    sessionId: z.string().uuid(),
    toolName: z.string(),
    approved: z.boolean(),
    resolvedAt: z.string().datetime(),
  }),
});

export const AgentProtocolEventSchema = z.discriminatedUnion("type", [
  TokenDeltaSchema,
  ToolCallStartedSchema,
  ToolCallCompletedSchema,
  StepStartedSchema,
  StepCompletedSchema,
  ApprovalRequestedSchema,
  ApprovalResolvedSchema,
]);

export type TokenDelta = z.infer<typeof TokenDeltaSchema>;
export type ToolCallStarted = z.infer<typeof ToolCallStartedSchema>;
export type ToolCallCompleted = z.infer<typeof ToolCallCompletedSchema>;
export type StepStarted = z.infer<typeof StepStartedSchema>;
export type StepCompleted = z.infer<typeof StepCompletedSchema>;
export type ApprovalRequested = z.infer<typeof ApprovalRequestedSchema>;
export type ApprovalResolved = z.infer<typeof ApprovalResolvedSchema>;
export type AgentProtocolEvent = z.infer<typeof AgentProtocolEventSchema>;
