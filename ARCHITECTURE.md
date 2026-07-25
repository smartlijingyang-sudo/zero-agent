# Architecture

pnpm workspaces + Turborepo. Dependency boundaries enforced via `eslint-plugin-boundaries` in CI.

## Directory Layout

```
zero-agent/
├── apps/                          # Deployable units (L5) — zero cross-app deps
│   ├── agent-worker/              # Agent runtime: concrete agents + deployment wiring
│   │   └── src/
│   │       ├── agents/            # Agent definitions (prompt + policy + tools)
│   │       │   ├── coder-agent/
│   │       │   └── planner-agent/
│   │       └── runtime/           # MQ subscription, Runner assembly, event publishing
│   ├── api/                       # HTTP API server
│   │   └── src/
│   │       └── modules/user/      # Domain-sliced: controller / service / repo / domain / events
│   ├── web/                       # Next.js frontend
│   │   └── src/
│   │       ├── app/               # Next.js app router
│   │       └── features/          # Feature modules (auth, chat) — each with api + store
│   └── worker/                    # Background job processor
│       └── src/
│
├── packages/                      # Shared libraries (L0–L4.5)
│   │
│   │  # ── L0: no internal deps ──
│   ├── contracts/                 # Zod schemas → types via z.infer (multi-export)
│   │   └── src/
│   │       ├── agent-events/      # Async MQ lifecycle events
│   │       ├── agent-protocol/    # Real-time streaming (token_delta, tool_call_*, approval_*)
│   │       ├── chat/
│   │       └── user/
│   ├── utils/                     # Pure utilities
│   ├── config/                    # Zod-validated configuration
│   │
│   │  # ── L1: depends on L0 only ──
│   ├── logger/
│   ├── observability/
│   ├── ui/                        # Shared React components (peer: react)
│   │
│   │  # ── L2: depends on L0 + L1 ──
│   ├── data-clients/              # Infrastructure client interfaces (multi-export)
│   │   └── src/
│   │       ├── db/
│   │       ├── cache/
│   │       ├── queue/
│   │       └── vector/
│   ├── sdk/                       # HTTP client for cross-app sync calls
│   ├── agent-providers/           # LLM provider governance: routing, retry, cost metering
│   │
│   │  # ── L3: depends on L0 + L1 + L2 ──
│   ├── agent-memory/              # Session / long-term memory store adapter
│   ├── agent-rag/                 # Chunking, embedding, vector retrieval
│   │
│   │  # ── L4: depends on L0–L3 ──
│   ├── agent-framework/           # Core abstractions (multi-export)
│   │   └── src/
│   │       ├── agent/             # Agent, Tool definitions
│   │       ├── runner/            # Execution loop
│   │       ├── handoff/           # Agent-to-agent handoff
│   │       ├── guardrails/       # Input/output checks per-tool-call
│   │       ├── tools/            # Built-in tool implementations
│   │       └── tracing/          # Observability integration
│   │
│   │  # ── L4.5: eval-only, never importable at runtime ──
│   └── agent-evals/               # Eval harness + scorer
│
├── eslint.config.js               # Boundary rules (single source of truth for layer enforcement)
├── tsconfig.base.json             # Shared compiler options
├── turbo.json                     # Build pipeline
└── pnpm-workspace.yaml            # Workspace definition
```

## Dependency Layers

```
L0    contracts, utils, config                 ← no internal deps
L1    logger, observability, ui                ← L0 only
L2    data-clients, sdk, agent-providers       ← L0 + L1
L3    agent-memory, agent-rag                  ← L0 + L1 + L2
L4    agent-framework                          ← L0 + L1 + L2 + L3
L4.5  agent-evals                              ← L0–L4 (never runtime)
L5    apps/*                                   ← packages per allow-list, zero cross-app
```

## Key Conventions

- **Contracts as single source of truth**: zod schemas in `contracts/`, types derived via `z.infer`
- **Cross-app communication**: sync via `sdk` (HTTP), async via `contracts/agent-events` (MQ)
- **Multi-export packages**: `contracts`, `data-clients`, `agent-framework` expose sub-path exports
- **Flat packages**: single-file packages expose `index.ts` at root (no `src/` wrapper)
- **Structured packages**: multi-module packages keep `src/` with sub-directories
- **Tool risk**: `Tool.risk: { sideEffects, requiresConfirmation }` — per-tool, not per-agent
- **agent-evals isolation**: excluded from all packages' allow lists — `default: "disallow"`

## App ↔ Package Boundary

| App            | Allowed packages                                                        |
|----------------|-------------------------------------------------------------------------|
| `web`          | contracts, utils, config, logger, observability, ui, data-clients, sdk  |
| `api`          | contracts, utils, config, logger, observability, data-clients, sdk, agent-providers |
| `agent-worker` | contracts, utils, config, logger, observability, data-clients, sdk, agent-providers, agent-memory, agent-rag, agent-framework |
| `worker`       | contracts, utils, config, logger, observability, data-clients, sdk      |

`api` may use `agent-providers` (one-shot model calls) but NOT `agent-framework` — full multi-step agent loops belong to `agent-worker` only.
