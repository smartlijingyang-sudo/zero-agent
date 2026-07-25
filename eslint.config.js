// @ts-check
import boundaries from "eslint-plugin-boundaries";

/**
 * Dependency layer rules (enforced in CI):
 *
 * L0  contracts, utils, config        → no internal deps
 * L1  logger, observability, ui        → L0 only
 * L2  data-clients, sdk                → L0 + L1
 * L3  apps/*                           → L0–L2 packages, zero cross-app deps
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
        // L3 — apps
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
            // L3: apps can depend on any package, but NOT on each other
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
              ],
            },
            {
              from: "app-agent-worker",
              allow: [
                "pkg-contracts", "pkg-utils", "pkg-config",
                "pkg-logger", "pkg-observability",
                "pkg-data-clients", "pkg-sdk",
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
