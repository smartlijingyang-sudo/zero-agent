# ADR-0001: Monorepo Structure & Dependency Boundaries

## Status
Accepted

## Context
We need a monorepo structure that supports multiple apps (web, api, agent-worker, worker) with clear dependency boundaries to prevent coupling.

## Decision
- pnpm workspaces + Turborepo for build orchestration
- Dependency layers enforced via eslint-plugin-boundaries:
  - L0: contracts, utils, config (no internal deps)
  - L1: logger, observability, ui (L0 only)
  - L2: data-clients, sdk (L0 + L1)
  - L3: apps/* (L0–L2 packages, zero cross-app deps)
- Contracts use zod schemas; types derived via z.infer
- Cross-app communication: sync via sdk (HTTP), async via contracts/agent-events over MQ

## Consequences
- Hard boundary enforcement in CI, not just code review
- Single source of truth for shared types (zod schemas)
- Affected-scope checks detect boundary leaks early
- Agent evals gate prompt/policy changes
