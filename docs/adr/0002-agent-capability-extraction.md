# ADR-0002: Agent Capability Extraction into Framework Packages

## Status
Accepted

## Context
All agent capabilities (adapters, agents, evals, guardrails, memory, orchestration, runtime, tools) were colocated inside `apps/agent-worker`. While the app/package boundary was correct, the framework-level logic was trapped inside a single deployment unit — making it impossible to reuse from a CLI playground, a serverless deployment target, or `apps/api` (for one-shot model calls) without code duplication or boundary violations.

Additionally:
- `requireHumanConfirmation` was an agent-level boolean, but tools have different risk profiles (file-edit has side effects, web-search is read-only).
- No real-time streaming protocol existed for the web/chat feature — only async MQ lifecycle events.
- No RAG / vector retrieval capability was defined.
- Evals harness and test datasets were not separated.

## Decision
Extract reusable agent framework logic from `apps/agent-worker` into five independent packages:

| Package | Responsibility | Layer |
|---------|---------------|-------|
| `agent-framework` | Core abstractions: Agent, Tool, Runner, Handoff, Guardrail, Tracing | L4 |
| `agent-providers` | LLM provider governance: routing, retry, cost metering | L2 |
| `agent-memory` | Session/long-term memory store adapter | L3 |
| `agent-rag` | Chunking, embedding, vector retrieval | L3 |
| `agent-evals` | Eval harness + scorer (never importable at runtime) | L4.5 |

`apps/agent-worker` is reduced to:
- `agents/` — concrete agent definitions (prompt + policy + tool wiring)
- `runtime/` — deployment wiring (MQ subscription, Runner assembly, event publishing)

Key interface changes:
- `Tool.risk: { sideEffects, requiresConfirmation }` replaces agent-level `requireHumanConfirmation`
- `Guardrail.checkInput()` / `checkOutput()` operate per-tool-call, not per-agent
- `contracts/agent-protocol` adds real-time streaming events (token_delta, tool_call_*, approval_*)
- `data-clients/vector` adds vector DB client interface
- `agent-evals` is excluded from all packages' `allow` list — `default: "disallow"` prevents runtime imports

Dependency layers extended from L0–L3 to L0–L5:
- L0: contracts, utils, config
- L1: logger, observability, ui
- L2: data-clients, sdk, agent-providers
- L3: agent-memory, agent-rag
- L4: agent-framework
- L4.5: agent-evals (eval-only, never runtime)
- L5: apps/*

`apps/api` is allowed `agent-providers` (for one-shot model calls) but NOT `agent-framework` — full multi-step agent loops remain the exclusive responsibility of `apps/agent-worker`.

## Consequences
- Agent capabilities are independently versioned, testable, and composable
- New deployment targets (CLI, serverless) can consume framework packages without pulling app-level code
- Tool-level risk granularity enables fine-grained human confirmation and guardrail policies
- Real-time protocol enables streaming UI in web/chat feature
- `agent-evals` isolation prevents eval harness from leaking into production bundles
- Breaking changes to `agent-framework` and `agent-providers` require cross-team review (@zero-agent/ai + @zero-agent/platform)
