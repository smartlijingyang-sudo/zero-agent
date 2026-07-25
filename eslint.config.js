// @ts-check
import boundaries from "eslint-plugin-boundaries";

/**
 * Dependency layer rules (enforced in CI):
 *
 * L0    contracts, utils, config                          → no internal deps
 * L1    logger, observability, ui                         → L0 only
 * L2    data-clients, sdk, agent-providers                → L0 + L1
 * L3    agent-memory, agent-rag                           → L0 + L1 + L2
 * L4    agent-framework                                   → L0 + L1 + L2 + L3
 * L4.5  agent-evals                                       → L0–L4 (never importable at runtime)
 * L5    apps/*                                            → packages as allowed below, zero cross-app deps
 */
export default [
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        // L0 — base
        { type: "pkg-contracts", pattern: "packages/contracts/*" },
        { type: "pkg-utils", pattern: "packages/utils/*" },
        { type: "pkg-config", pattern: "packages/config/*" },
        // L1
        { type: "pkg-logger", pattern: "packages/logger/*" },
        { type: "pkg-observability", pattern: "packages/observability/*" },
        { type: "pkg-ui", pattern: "packages/ui/*" },
        // L2
        { type: "pkg-data-clients", pattern: "packages/data-clients/*" },
        { type: "pkg-sdk", pattern: "packages/sdk/*" },
        { type: "pkg-agent-providers", pattern: "packages/agent-providers/*" },
        // L3
        { type: "pkg-agent-memory", pattern: "packages/agent-memory/*" },
        { type: "pkg-agent-rag", pattern: "packages/agent-rag/*" },
        // L4
        { type: "pkg-agent-framework", pattern: "packages/agent-framework/*" },
        // L4.5
        { type: "pkg-agent-evals", pattern: "packages/agent-evals/*" },
        // L5 — apps
        { type: "app-web", pattern: "apps/web/*" },
        { type: "app-api", pattern: "apps/api/*" },
        { type: "app-agent-worker", pattern: "apps/agent-worker/*" },
        { type: "app-worker", pattern: "apps/worker/*" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // L0: no internal deps
            { from: "pkg-contracts", allow: [] },
            { from: "pkg-utils", allow: [] },
            { from: "pkg-config", allow: [] },
            // L1: only L0
            { from: "pkg-logger", allow: ["pkg-contracts", "pkg-utils", "pkg-config"] },
            { from: "pkg-observability", allow: ["pkg-contracts", "pkg-utils", "pkg-config"] },
            { from: "pkg-ui", allow: ["pkg-contracts", "pkg-utils", "pkg-config"] },
            // L2: L0 + L1
            {
              from: "pkg-data-clients",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
              ],
            },
            {
              from: "pkg-sdk",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
              ],
            },
            {
              from: "pkg-agent-providers",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
              ],
            },
            // L3: L0 + L1 + L2
            {
              from: "pkg-agent-memory",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients",
              ],
            },
            {
              from: "pkg-agent-rag",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients", "pkg-agent-providers",
              ],
            },
            // L4: L0 + L1 + L2 + L3
            {
              from: "pkg-agent-framework",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-agent-providers", "pkg-agent-memory", "pkg-agent-rag",
              ],
            },
            // L4.5: agent-evals can depend on everything below it,
            // but nothing else is allowed to import agent-evals (default: disallow).
            {
              from: "pkg-agent-evals",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients", "pkg-sdk",
                "pkg-agent-providers", "pkg-agent-memory", "pkg-agent-rag",
                "pkg-agent-framework",
              ],
            },
            // L5: apps
            {
              from: "app-web",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability", "pkg-ui",
                "pkg-data-clients", "pkg-sdk",
              ],
            },
            {
              from: "app-api",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients", "pkg-sdk",
                "pkg-agent-providers",
              ],
            },
            {
              from: "app-agent-worker",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients", "pkg-sdk",
                "pkg-agent-providers", "pkg-agent-memory", "pkg-agent-rag",
                "pkg-agent-framework",
              ],
            },
            {
              from: "app-worker",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients", "pkg-sdk",
              ],
            },
          ],
        },
      ],
    },
  },
];
